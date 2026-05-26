package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.dto.reports.DailyCountDto;
import com.ehr.staffservice.dto.reports.HeatmapBucketDto;
import com.ehr.staffservice.dto.reports.ProviderUtilizationDto;
import com.ehr.staffservice.dto.reports.SchedulingSummaryDto;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.entity.Doctor;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Appointment Service Implementation
 * Uses TIMESTAMP-based operations with the appointment table
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository repository;
    private final DoctorRepository doctorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDto> queryAppointments(
            LocalDateTime start,
            LocalDateTime end,
            List<Long> doctorIds,
            List<Long> departmentIds,
            List<String> statuses,
            List<Long> roomIds) {
        
        // Pass null instead of empty list to avoid HQL type issues
        List<Long> doctorIdsParam = (doctorIds == null || doctorIds.isEmpty()) ? null : doctorIds;
        List<Long> roomIdsParam = (roomIds == null || roomIds.isEmpty()) ? null : roomIds;
        List<Appointment> appointments = repository.findByDateRange(start, end, doctorIdsParam, roomIdsParam);
        
        // Filter by department and status if provided
        return appointments.stream()
                .filter(a -> departmentIds == null || departmentIds.isEmpty() || 
                           (a.getDepartmentId() != null && departmentIds.contains(a.getDepartmentId())))
                .filter(a -> statuses == null || statuses.isEmpty() || 
                           statuses.contains(a.getStatus()))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentDto moveAppointment(Long id, AppointmentMoveRequest request) {
        Appointment appointment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        // Validate new start time
        LocalDateTime newStart = request.getStartAt() != null ? request.getStartAt() : appointment.getStartAt();
        if (newStart == null) {
            throw new IllegalArgumentException("Start datetime is required");
        }
        
        // Validate duration
        if (appointment.getDurationMinutes() == null || appointment.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }
        
        // Calculate and validate end datetime
        LocalDateTime newEnd = newStart.plusMinutes(appointment.getDurationMinutes());
        if (newEnd.isBefore(newStart) || newEnd.equals(newStart)) {
            throw new IllegalArgumentException("End datetime must be after start datetime");
        }
        
        Long newDoctorId = request.getDoctorId() != null ? request.getDoctorId() : appointment.getDoctorId();

        List<Appointment> conflicts = repository.findConflictingAppointments(
                newDoctorId, newStart, newEnd, id);

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Doctor has conflicting appointment at this time");
        }

        // Update appointment
        appointment.setStartAt(newStart);
        appointment.setEndAt(newEnd);
        if (request.getDoctorId() != null) {
            appointment.setDoctorId(request.getDoctorId());
        }
        if (request.getRoomId() != null) {
            appointment.setRoomId(request.getRoomId());
        }

        try {
            Appointment saved = repository.save(appointment);
            log.info("Appointment moved successfully: id={}, newStartAt={}, newDoctorId={}", 
                    saved.getId(), saved.getStartAt(), saved.getDoctorId());
            return toDto(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Failed to move appointment due to constraint violation: id={}, newDoctorId={}, error={}", 
                    id, request.getDoctorId(), e.getMessage(), e);
            throw new IllegalStateException("Failed to move appointment: " + 
                    (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()), e);
        }
    }

    @Override
    @Transactional
    public AppointmentDto resizeAppointment(Long id, AppointmentResizeRequest request) {
        Appointment appointment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        // Validate duration
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }
        
        // Validate start datetime
        if (appointment.getStartAt() == null) {
            throw new IllegalArgumentException("Start datetime is required");
        }
        
        // Calculate and validate end datetime
        LocalDateTime newEnd = appointment.getStartAt().plusMinutes(request.getDurationMinutes());
        if (newEnd.isBefore(appointment.getStartAt()) || newEnd.equals(appointment.getStartAt())) {
            throw new IllegalArgumentException("End datetime must be after start datetime");
        }
        
        // Check for conflicts with new duration
        List<Appointment> conflicts = repository.findConflictingAppointments(
                appointment.getDoctorId(), appointment.getStartAt(), newEnd, id);

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Resizing would create conflict with existing appointment");
        }

        // Update duration
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setEndAt(newEnd);

        try {
            Appointment saved = repository.save(appointment);
            log.info("Appointment resized successfully: id={}, newDuration={}", 
                    saved.getId(), saved.getDurationMinutes());
            return toDto(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Failed to resize appointment due to constraint violation: id={}, newDuration={}, error={}", 
                    id, request.getDurationMinutes(), e.getMessage(), e);
            throw new IllegalStateException("Failed to resize appointment: " + 
                    (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()), e);
        }
    }

    @Override
    @Transactional
    public AppointmentDto updateAppointmentStatus(Long appointmentId, String status, String reason) {
        // Find appointment
        Appointment appointment = repository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + appointmentId));

        // Validate status is not blank
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status is required");
        }

        // Normalize status to UPPER_SNAKE_CASE and validate against allowed constants
        String normalizedStatus = normalizeStatusToUpperSnake(status);
        
        // Validate against AppointmentStatus constants
        if (!isValidStatus(normalizedStatus)) {
            throw new IllegalArgumentException("Invalid status: " + status + ". Allowed: SCHEDULED, CONFIRMED, ARRIVED, CHECKED_IN, CHECKED_OUT, CANCELLED, NO_SHOW");
        }
        
        // Validate: CANCELLED and NO_SHOW require reason
        if ((Appointment.AppointmentStatus.CANCELLED.equals(normalizedStatus) || 
             Appointment.AppointmentStatus.NO_SHOW.equals(normalizedStatus)) 
                && (reason == null || reason.trim().isEmpty())) {
            throw new IllegalArgumentException("Reason is required for CANCELLED or NO_SHOW status");
        }

        // Update status
        appointment.setStatus(normalizedStatus);
        
        // Store status reason in notes (append, don't overwrite existing notes)
        if (reason != null && !reason.trim().isEmpty()) {
            String timestamp = LocalDateTime.now().toString();
            String statusReasonNote = String.format("[STATUS_REASON] %s - %s - %s", 
                    normalizedStatus, reason.trim(), timestamp);
            
            String existingNotes = appointment.getNotes();
            if (existingNotes == null || existingNotes.trim().isEmpty()) {
                appointment.setNotes(statusReasonNote);
            } else {
                appointment.setNotes(existingNotes + "\n" + statusReasonNote);
            }
        }
        
        // Only set appointment.setReason() if reason field is null/blank (preserve visit reason)
        if (appointment.getReason() == null || appointment.getReason().trim().isEmpty()) {
            if (reason != null && !reason.trim().isEmpty()) {
                appointment.setReason(reason.trim());
            }
        }
        // If appointment.reason already has a value (visit reason), don't overwrite it

        try {
            Appointment saved = repository.saveAndFlush(appointment); // flush for optimistic lock
            log.info("Appointment status updated successfully: id={}, newStatus={}, reason={}", 
                    saved.getId(), saved.getStatus(), reason);
            return toDto(saved);
        } catch (org.springframework.orm.ObjectOptimisticLockingFailureException e) {
            log.warn("Optimistic locking conflict updating appointment status: id={}, status={}", 
                    appointmentId, status);
            throw new IllegalStateException("Appointment was modified by another user. Please refresh and try again.");
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Failed to update appointment status due to constraint violation: id={}, status={}, error={}", 
                    appointmentId, status, e.getMessage(), e);
            throw new IllegalStateException("Failed to update appointment status: " + 
                    (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()), e);
        }
    }

    /**
     * Normalize status string to UPPER_SNAKE_CASE matching AppointmentStatus constants
     */
    private String normalizeStatusToUpperSnake(String status) {
        if (status == null || status.trim().isEmpty()) {
            return Appointment.AppointmentStatus.SCHEDULED;
        }
        String upper = status.trim().toUpperCase();
        // Handle common variations
        if (upper.contains("SCHEDULED") || upper.equals("SCHEDULE")) {
            return Appointment.AppointmentStatus.SCHEDULED;
        } else if (upper.contains("CONFIRMED")) {
            return Appointment.AppointmentStatus.CONFIRMED;
        } else if (upper.contains("ARRIVED")) {
            return Appointment.AppointmentStatus.ARRIVED;
        } else if (upper.contains("CHECKED_IN") || upper.equals("CHECKED IN")) {
            return Appointment.AppointmentStatus.CHECKED_IN;
        } else if (upper.contains("CHECKED_OUT") || upper.equals("CHECKED OUT")) {
            return Appointment.AppointmentStatus.CHECKED_OUT;
        } else if (upper.contains("CANCELLED") || upper.contains("CANCELED")) {
            return Appointment.AppointmentStatus.CANCELLED;
        } else if (upper.contains("NO_SHOW") || upper.equals("NOSHOW") || upper.equals("NO SHOW")) {
            return Appointment.AppointmentStatus.NO_SHOW;
        }
        // If already in UPPER_SNAKE format, return as-is
        return upper;
    }

    /**
     * Validate status against AppointmentStatus constants
     */
    private boolean isValidStatus(String status) {
        if (status == null) {
            return false;
        }
        return status.equals(Appointment.AppointmentStatus.SCHEDULED) ||
               status.equals(Appointment.AppointmentStatus.CONFIRMED) ||
               status.equals(Appointment.AppointmentStatus.ARRIVED) ||
               status.equals(Appointment.AppointmentStatus.CHECKED_IN) ||
               status.equals(Appointment.AppointmentStatus.CHECKED_OUT) ||
               status.equals(Appointment.AppointmentStatus.CANCELLED) ||
               status.equals(Appointment.AppointmentStatus.NO_SHOW);
    }

    @Override
    @Transactional
    public AppointmentDto createAppointment(AppointmentDto request) {
        // Validate duration
        if (request.getDurationMinutes() == null || request.getDurationMinutes() <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }
        
        // Validate start datetime
        if (request.getStartDateTime() == null) {
            throw new IllegalArgumentException("Start datetime is required");
        }
        
        // Calculate and validate end datetime
        LocalDateTime endDateTime = request.getStartDateTime().plusMinutes(request.getDurationMinutes());
        if (endDateTime.isBefore(request.getStartDateTime()) || endDateTime.equals(request.getStartDateTime())) {
            throw new IllegalArgumentException("End datetime must be after start datetime");
        }
        
        // Check for conflicts
        List<Appointment> conflicts = repository.findConflictingAppointments(
                request.getDoctorId(), request.getStartDateTime(), endDateTime, null);

        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Doctor has conflicting appointment at this time");
        }

        // Create entity
        Appointment appointment = new Appointment();
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(request.getDoctorId());
        appointment.setDepartmentId(request.getDepartmentId());
        appointment.setLocationId(request.getLocationId());
        appointment.setStartAt(request.getStartDateTime());
        appointment.setEndAt(endDateTime);
        appointment.setDurationMinutes(request.getDurationMinutes());
        appointment.setVisitTypeId(request.getVisitTypeId());
        appointment.setVisitType(request.getVisitType()); // String fallback
        appointment.setStatus(request.getStatus() != null ? request.getStatus() : Appointment.AppointmentStatus.SCHEDULED);
        appointment.setPriority(request.getPriority() != null ? request.getPriority() : Appointment.AppointmentPriority.NORMAL);
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());

        try {
            Appointment saved = repository.save(appointment);
            log.info("Appointment created successfully: id={}, patientId={}, doctorId={}, startAt={}, endAt={}", 
                    saved.getId(), saved.getPatientId(), saved.getDoctorId(), saved.getStartAt(), saved.getEndAt());
            return toDto(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Failed to create appointment due to constraint violation: patientId={}, doctorId={}, startAt={}, error={}", 
                    request.getPatientId(), request.getDoctorId(), request.getStartDateTime(), e.getMessage(), e);
            throw new IllegalStateException("Failed to create appointment: " + 
                    (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()), e);
        } catch (Exception e) {
            log.error("Unexpected error creating appointment: patientId={}, doctorId={}, startAt={}, error={}", 
                    request.getPatientId(), request.getDoctorId(), request.getStartDateTime(), e.getMessage(), e);
            throw e;
        }
    }

    @Override
    @Transactional
    public AppointmentDto updateAppointment(Long id, AppointmentDto request) {
        Appointment appointment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));

        // Validate and get new values
        LocalDateTime newStart = request.getStartDateTime() != null ? 
                request.getStartDateTime() : appointment.getStartAt();
        if (newStart == null) {
            throw new IllegalArgumentException("Start datetime is required");
        }
        
        Integer newDuration = request.getDurationMinutes() != null ? 
                request.getDurationMinutes() : appointment.getDurationMinutes();
        if (newDuration == null || newDuration <= 0) {
            throw new IllegalArgumentException("Duration must be greater than 0");
        }
        
        // Calculate and validate end datetime
        LocalDateTime newEnd = newStart.plusMinutes(newDuration);
        if (newEnd.isBefore(newStart) || newEnd.equals(newStart)) {
            throw new IllegalArgumentException("End datetime must be after start datetime");
        }
        
        Long newDoctorId = request.getDoctorId() != null ? 
                request.getDoctorId() : appointment.getDoctorId();

        if (!newStart.equals(appointment.getStartAt()) || 
            !newDuration.equals(appointment.getDurationMinutes()) ||
            !newDoctorId.equals(appointment.getDoctorId())) {
            
            List<Appointment> conflicts = repository.findConflictingAppointments(
                    newDoctorId, newStart, newEnd, id);
            
            if (!conflicts.isEmpty()) {
                throw new IllegalStateException("Update would create conflict with existing appointment");
            }
        }

        // Update fields
        appointment.setPatientId(request.getPatientId());
        appointment.setDoctorId(newDoctorId);
        appointment.setDepartmentId(request.getDepartmentId());
        appointment.setLocationId(request.getLocationId());
        appointment.setStartAt(newStart);
        appointment.setEndAt(newEnd);
        appointment.setDurationMinutes(newDuration);
        appointment.setVisitTypeId(request.getVisitTypeId());
        appointment.setVisitType(request.getVisitType()); // String fallback
        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }
        if (request.getPriority() != null) {
            appointment.setPriority(request.getPriority());
        }
        appointment.setReason(request.getReason());
        appointment.setNotes(request.getNotes());

        try {
            Appointment saved = repository.save(appointment);
            log.info("Appointment updated successfully: id={}, patientId={}, doctorId={}, status={}", 
                    saved.getId(), saved.getPatientId(), saved.getDoctorId(), saved.getStatus());
            return toDto(saved);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            log.error("Failed to update appointment due to constraint violation: id={}, patientId={}, doctorId={}, error={}", 
                    id, request.getPatientId(), request.getDoctorId(), e.getMessage(), e);
            throw new IllegalStateException("Failed to update appointment: " + 
                    (e.getCause() != null ? e.getCause().getMessage() : e.getMessage()), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDto getAppointment(Long id) {
        Appointment appointment = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found: " + id));
        return toDto(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDto> getByPatient(Long patientId) {
        List<Appointment> appointments = repository.findByPatientIdOrderByStartAtDesc(patientId);
        return appointments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDto> getByDoctor(Long doctorId) {
        List<Appointment> appointments = repository.findByDoctorIdOrderByStartAtDesc(doctorId);
        return appointments.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Helper method - single DTO converter
    private AppointmentDto toDto(Appointment appointment) {
        AppointmentDto dto = new AppointmentDto();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatientId());
        dto.setDoctorId(appointment.getDoctorId());
        dto.setDepartmentId(appointment.getDepartmentId());
        dto.setLocationId(appointment.getLocationId());
        dto.setStartDateTime(appointment.getStartAt());
        dto.setEndDateTime(appointment.getEndAt());
        dto.setDurationMinutes(appointment.getDurationMinutes());
        dto.setVisitTypeId(appointment.getVisitTypeId());
        dto.setVisitType(appointment.getVisitType()); // String fallback
        dto.setStatus(appointment.getStatus());
        dto.setPriority(appointment.getPriority());
        dto.setReason(appointment.getReason());
        dto.setNotes(appointment.getNotes());
        
        // Convert Timestamp to LocalDateTime for audit fields
        if (appointment.getCreatedAt() != null) {
            dto.setCreatedAt(appointment.getCreatedAt().toLocalDateTime());
        }
        if (appointment.getUpdatedAt() != null) {
            dto.setUpdatedAt(appointment.getUpdatedAt().toLocalDateTime());
        }
        
        // Populate names and avatars if relationships are loaded
        if (appointment.getPatient() != null) {
            dto.setPatientName(appointment.getPatient().getFirstName() + " " + 
                             appointment.getPatient().getLastName());
            dto.setPatientAvatarUrl(appointment.getPatient().getPhotoUrl());
        }
        if (appointment.getDoctor() != null && appointment.getDoctor().getStaff() != null) {
            dto.setDoctorName(appointment.getDoctor().getStaff().getFirstName() + " " + 
                              appointment.getDoctor().getStaff().getLastName());
            dto.setDoctorAvatarUrl(appointment.getDoctor().getStaff().getPhotoUrl());
        }
        if (appointment.getDepartment() != null) {
            dto.setDepartmentName(appointment.getDepartment().getName());
        }
        
        return dto;
    }

    // ============================================================================
    // REPORTING METHODS
    // ============================================================================

    @Override
    @Transactional(readOnly = true)
    public SchedulingSummaryDto getSchedulingSummary(
            LocalDateTime start,
            LocalDateTime end,
            List<Long> doctorIds) {
        
        // Handle null/empty doctorIds
        List<Long> doctorIdsParam = (doctorIds == null || doctorIds.isEmpty()) ? null : doctorIds;
        
        // Get total count
        Long totalAppointments = repository.countByDateRange(start, end, doctorIdsParam);
        if (totalAppointments == null) {
            totalAppointments = 0L;
        }
        
        // Get urgent count
        Long urgentCount = repository.countUrgentByDateRange(start, end, doctorIdsParam);
        if (urgentCount == null) {
            urgentCount = 0L;
        }
        
        // Get status counts
        List<Object[]> statusCountsRaw = repository.countByStatusAndDateRange(start, end, doctorIdsParam);
        Map<String, Long> statusCounts = new HashMap<>();
        if (statusCountsRaw != null) {
            for (Object[] row : statusCountsRaw) {
                String status = (String) row[0];
                Long count = ((Number) row[1]).longValue();
                // Normalize status names to lowercase for consistency
                String normalizedStatus = normalizeStatus(status);
                statusCounts.put(normalizedStatus, count);
            }
        }
        // Ensure all statuses are present with 0 if not found
        statusCounts.putIfAbsent("scheduled", 0L);
        statusCounts.putIfAbsent("confirmed", 0L);
        statusCounts.putIfAbsent("arrived", 0L);
        statusCounts.putIfAbsent("cancelled", 0L);
        statusCounts.putIfAbsent("noshow", 0L);
        
        // Get daily counts
        List<Object[]> dailyCountsRaw = repository.countByDayAndDateRange(start, end, doctorIdsParam);
        List<DailyCountDto> dailyCounts = new ArrayList<>();
        if (dailyCountsRaw != null) {
            for (Object[] row : dailyCountsRaw) {
                // Handle native query result - could be Date or LocalDate
                LocalDate date;
                if (row[0] instanceof java.sql.Date) {
                    date = ((java.sql.Date) row[0]).toLocalDate();
                } else if (row[0] instanceof LocalDate) {
                    date = (LocalDate) row[0];
                } else {
                    // Fallback: try to parse as string or use current date
                    date = LocalDate.now();
                }
                Long count = ((Number) row[1]).longValue();
                dailyCounts.add(new DailyCountDto(date.toString(), count));
            }
        }
        
        // Get heatmap buckets (day of week x hour)
        List<HeatmapBucketDto> heatmapBuckets = new ArrayList<>();
        try {
            List<Object[]> heatmapBucketsRaw = repository.getHeatmapBuckets(start, end, doctorIdsParam);
            if (heatmapBucketsRaw != null && !heatmapBucketsRaw.isEmpty()) {
                for (Object[] row : heatmapBucketsRaw) {
                    if (row != null && row.length >= 3) {
                        try {
                            Integer dayOfWeek = row[0] != null ? ((Number) row[0]).intValue() : 0;
                            Integer hour = row[1] != null ? ((Number) row[1]).intValue() : 0;
                            Long count = row[2] != null ? ((Number) row[2]).longValue() : 0L;
                            
                            // Validate dayOfWeek is 0-6 and hour is 0-23
                            if (dayOfWeek >= 0 && dayOfWeek <= 6 && hour >= 0 && hour <= 23) {
                                heatmapBuckets.add(new HeatmapBucketDto(dayOfWeek, hour, count));
                            }
                        } catch (Exception ex) {
                            log.warn("Error parsing heatmap bucket row: {}", ex.getMessage());
                            // Skip invalid rows
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error fetching heatmap buckets: {}", e.getMessage(), e);
            // Return empty list on error - don't fail the entire request
            // The frontend will show an empty heatmap
        }
        
        return new SchedulingSummaryDto(totalAppointments, urgentCount, statusCounts, dailyCounts, heatmapBuckets);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderUtilizationDto> getProviderUtilization(
            LocalDateTime start,
            LocalDateTime end,
            List<Long> doctorIds) {
        
        // Handle null/empty doctorIds
        List<Long> doctorIdsParam = (doctorIds == null || doctorIds.isEmpty()) ? null : doctorIds;
        
        // Get utilization data
        List<Object[]> utilizationRaw = repository.getProviderUtilization(start, end, doctorIdsParam);
        List<ProviderUtilizationDto> result = new ArrayList<>();
        
        if (utilizationRaw != null) {
            for (Object[] row : utilizationRaw) {
                Long doctorId = ((Number) row[0]).longValue();
                Long totalAppointments = ((Number) row[1]).longValue();
                Long totalMinutes = ((Number) row[2]).longValue();
                
                // Get doctor name
                String doctorName = "Unknown Doctor";
                Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
                if (doctorOpt.isPresent()) {
                    Doctor doctor = doctorOpt.get();
                    if (doctor.getStaff() != null) {
                        doctorName = doctor.getStaff().getFirstName() + " " + doctor.getStaff().getLastName();
                    } else if (doctor.getDoctorCode() != null) {
                        doctorName = "Doctor " + doctor.getDoctorCode();
                    }
                }
                
                result.add(new ProviderUtilizationDto(doctorId, doctorName, totalAppointments, totalMinutes));
            }
        }
        
        return result;
    }

    /**
     * Normalize status string to lowercase key
     */
    private String normalizeStatus(String status) {
        if (status == null) {
            return "scheduled";
        }
        String normalized = status.toUpperCase();
        // Map common status variations
        if (normalized.contains("SCHEDULED") || normalized.equals("SCHEDULE")) {
            return "scheduled";
        } else if (normalized.contains("CONFIRMED")) {
            return "confirmed";
        } else if (normalized.contains("ARRIVED") || normalized.contains("CHECKED_IN")) {
            return "arrived";
        } else if (normalized.contains("CANCELLED") || normalized.contains("CANCELED")) {
            return "cancelled";
        } else if (normalized.contains("NO_SHOW") || normalized.contains("NOSHOW")) {
            return "noshow";
        }
        return normalized.toLowerCase();
    }
}

