package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.PatientEncounterDto;
import com.ehr.staffservice.dto.PatientEncounterDetailDto;
import com.ehr.staffservice.entity.Doctor;
import com.ehr.staffservice.entity.Encounter;
import com.ehr.staffservice.entity.Staff;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.repository.EncounterRepository;
import com.ehr.staffservice.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service to get patient encounters for MyChart.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PatientEncounterService {

    private final EncounterRepository encounterRepository;
    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;

    /**
     * Get encounters for a patient within a date range.
     */
    @Transactional(readOnly = true)
    public List<PatientEncounterDto> getEncounters(Long patientId, LocalDate from, LocalDate to) {
        LocalDateTime startDateTime = from != null ? from.atStartOfDay() : LocalDate.now().minusYears(2).atStartOfDay();
        LocalDateTime endDateTime = to != null ? to.atTime(23, 59, 59) : LocalDateTime.now();

        List<Encounter> encounters = encounterRepository.findByPatientIdAndDateRange(
                patientId, startDateTime, endDateTime);

        return encounters.stream()
                .map(this::toDto)
                .sorted((e1, e2) -> {
                    // Sort by date descending (most recent first)
                    LocalDateTime d1 = parseDateTime(e1.getDateTime());
                    LocalDateTime d2 = parseDateTime(e2.getDateTime());
                    if (d1 == null || d2 == null) return 0;
                    return d2.compareTo(d1);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get all encounters for a patient (no date filter).
     */
    @Transactional(readOnly = true)
    public List<PatientEncounterDto> getAllEncounters(Long patientId) {
        List<Encounter> encounters = encounterRepository.findByPatientId(patientId);

        return encounters.stream()
                .map(this::toDto)
                .sorted((e1, e2) -> {
                    LocalDateTime d1 = parseDateTime(e1.getDateTime());
                    LocalDateTime d2 = parseDateTime(e2.getDateTime());
                    if (d1 == null || d2 == null) return 0;
                    return d2.compareTo(d1);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get detailed encounter by ID.
     */
    @Transactional(readOnly = true)
    public PatientEncounterDetailDto getEncounterDetail(Long patientId, Long encounterId) {
        Encounter encounter = encounterRepository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with ID: " + encounterId));

        // Verify the encounter belongs to the patient
        Long encounterPatientId = encounter.getPatientId();
        if (encounterPatientId == null || !encounterPatientId.equals(patientId)) {
            throw new ResourceNotFoundException("Encounter not found for patient");
        }

        PatientEncounterDetailDto detail = new PatientEncounterDetailDto();
        
        // Copy base fields
        PatientEncounterDto base = toDto(encounter);
        detail.setEncounterId(base.getEncounterId());
        detail.setDateTime(base.getDateTime());
        detail.setType(base.getType());
        detail.setDepartment(base.getDepartment());
        detail.setProvider(base.getProvider());
        detail.setLocation(base.getLocation());
        detail.setStatus(base.getStatus());
        detail.setReason(base.getReason());
        detail.setSummary(base.getSummary());
        detail.setLinks(base.getLinks());

        // Add detail fields
        // For now, we'll leave these empty as they would come from other services
        // In a real system, you'd fetch diagnoses, vitals, medication changes, orders from respective services
        detail.setDiagnoses(null);
        detail.setNotes(encounter.getNotes());
        detail.setVitals(null);
        detail.setMedicationsChanged(null);
        detail.setOrders(null);

        return detail;
    }

    private PatientEncounterDto toDto(Encounter encounter) {
        PatientEncounterDto dto = new PatientEncounterDto();
        dto.setEncounterId(encounter.getId());

        // Use checkInDateTime if available, otherwise arrivalDateTime, otherwise created date
        LocalDateTime encounterDateTime = encounter.getCheckInDateTime();
        if (encounterDateTime == null) {
            encounterDateTime = encounter.getArrivalDateTime();
        }
        if (encounterDateTime == null && encounter.getCreatedAt() != null) {
            encounterDateTime = encounter.getCreatedAt().toLocalDateTime();
        }
        dto.setDateTime(encounterDateTime != null ? 
                encounterDateTime.format(DateTimeFormatter.ISO_DATE_TIME) : null);

        // Map encounter type
        dto.setType(mapEncounterType(encounter.getEncounterType()));

        // Get department (would need Department entity lookup)
        dto.setDepartment(null);

        // Get provider info
        dto.setProvider(buildProviderInfo(encounter.getDoctorId()));

        dto.setLocation(encounter.getLocation());
        dto.setStatus(mapEncounterStatus(encounter.getEncounterStatus()));
        dto.setReason(encounter.getVisitReason());
        dto.setSummary(encounter.getNotes()); // Use notes as summary for now

        // Build links
        PatientEncounterDto.EncounterLinksDto links = new PatientEncounterDto.EncounterLinksDto(
                "/encounters/" + encounter.getId() + "/summary",
                "/billing?encounter=" + encounter.getId(),
                "/results?encounter=" + encounter.getId()
        );
        dto.setLinks(links);

        return dto;
    }

    private PatientEncounterDto.ProviderInfoDto buildProviderInfo(Long doctorId) {
        if (doctorId == null) {
            return null;
        }

        try {
            Optional<Doctor> doctorOpt = doctorRepository.findById(doctorId);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                Staff staff = doctor.getStaff();
                if (staff != null) {
                    String name = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " +
                                  (staff.getLastName() != null ? staff.getLastName() : "");
                    return new PatientEncounterDto.ProviderInfoDto(
                            staff.getStaffId(),
                            name.trim(),
                            doctor.getSpecialization() != null ? doctor.getSpecialization() : "General"
                    );
                }
            } else {
                // Try as Staff directly
                Optional<Staff> staffOpt = staffRepository.findById(doctorId);
                if (staffOpt.isPresent()) {
                    Staff staff = staffOpt.get();
                    String name = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " +
                                  (staff.getLastName() != null ? staff.getLastName() : "");
                    return new PatientEncounterDto.ProviderInfoDto(
                            staff.getStaffId(),
                            name.trim(),
                            "Provider"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Error loading provider for encounter: {}", e.getMessage());
        }

        return null;
    }

    private String mapEncounterType(Encounter.EncounterType type) {
        if (type == null) return "OFFICE_VISIT";
        
        switch (type) {
            case OUTPATIENT:
            case AMBULATORY:
            case FOLLOW_UP:
                return "OFFICE_VISIT";
            case URGENT_CARE:
                return "URGENT_CARE";
            case EMERGENCY:
                return "URGENT_CARE";
            case INPATIENT:
            case OBSERVATION:
                return "OFFICE_VISIT";
            case SURGERY:
            case PROCEDURE:
            case CONSULTATION:
                return "OFFICE_VISIT";
            default:
                return "OFFICE_VISIT";
        }
    }

    private String mapEncounterStatus(Encounter.EncounterStatus status) {
        if (status == null) return "SCHEDULED";
        
        switch (status) {
            case SCHEDULED:
                return "SCHEDULED";
            case ARRIVED:
            case CHECKED_IN:
            case IN_PROGRESS:
                return "SCHEDULED"; // Show as scheduled until completed
            case CHECKED_OUT:
            case DISCHARGED:
                return "COMPLETED";
            case CANCELLED:
                return "CANCELLED";
            case NO_SHOW:
                return "NO_SHOW";
            default:
                return "SCHEDULED";
        }
    }

    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null) return null;
        try {
            return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            return null;
        }
    }
}

