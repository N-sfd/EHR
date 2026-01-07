package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.AppointmentDto;
import com.ehr.staffservice.dto.CalendarViewDto;
import com.ehr.staffservice.dto.TimeSlotDto;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.AppointmentMapper;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.DayOfWeek;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository repository;
    private final AppointmentMapper mapper;

    @Override
    @Transactional
    public AppointmentDto create(AppointmentDto dto) {
        Appointment entity = mapper.toEntity(dto);
        entity.setAppointmentId(null); // ensure insert

        // Convert date and time strings if needed
        if (dto.getAppointmentDate() == null && dto.getAppointmentCode() != null) {
            // Handle case where frontend sends date as string
            // This is handled by Jackson automatically for LocalDate
        }

        Appointment saved = repository.save(entity);
        AppointmentDto result = mapper.toDto(saved);
        
        populateNames(saved, result);
        return result;
    }

    @Override
    @Transactional
    public AppointmentDto update(Long id, AppointmentDto dto) {
        Appointment existing = Objects.requireNonNull(
                repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Appointment not found")),
                "Appointment must not be null"
        );

        mapper.updateEntityFromDto(dto, existing);
        Appointment saved = repository.save(existing);
        AppointmentDto result = mapper.toDto(saved);
        populateNames(saved, result);
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentDto get(Long id) {
        Appointment entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        // Force fetch of lazy relationships
        if (entity.getDoctor() != null) {
            entity.getDoctor().getFirstName(); // Trigger lazy load
        }
        if (entity.getPatient() != null) {
            entity.getPatient().getFirstName(); // Trigger lazy load
        }
        if (entity.getDepartment() != null) {
            entity.getDepartment().getName(); // Trigger lazy load
        }
        AppointmentDto dto = mapper.toDto(entity);
        populateNames(entity, dto);
        return dto;
    }
    
    private void populateNames(Appointment entity, AppointmentDto dto) {
        // Populate doctor information
        if (entity.getDoctor() != null) {
            dto.setDoctorName(entity.getDoctor().getFirstName() + " " + entity.getDoctor().getLastName());
            dto.setDoctorImage(entity.getDoctor().getPhotoUrl());
        }
        
        // Populate patient information
        if (entity.getPatient() != null) {
            dto.setPatientName(entity.getPatient().getFirstName() + " " + entity.getPatient().getLastName());
            dto.setPatientPhone(entity.getPatient().getPhoneNumber());
            dto.setPatientImage(entity.getPatient().getPhotoUrl());
        }
        
        // Populate department information
        if (entity.getDepartment() != null) {
            dto.setDepartmentName(entity.getDepartment().getName());
        }
    }

    @Override
    public AppointmentDto getByCode(String code) {
        Appointment entity = repository.findByAppointmentCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with code: " + code));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentDto> getAll() {
        return repository.findAll()
                .stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<AppointmentDto> getByDoctor(Long doctorId) {
        return repository.findByDoctorId(doctorId)
                .stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<AppointmentDto> getByPatient(Long patientId) {
        return repository.findByPatientId(patientId)
                .stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<AppointmentDto> getByDepartment(Long departmentId) {
        return repository.findByDepartmentId(departmentId)
                .stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .toList();
    }

    @Override
    public List<AppointmentDto> getByDateRange(String startDate, String endDate) {
        LocalDate start = LocalDate.parse(startDate);
        LocalDate end = LocalDate.parse(endDate);
        return repository.findByDateRange(start, end)
                .stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Appointment not found");
        }
        repository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarViewDto getWeekView(LocalDate weekStart, Long doctorId) {
        LocalDate weekEnd = weekStart.plusDays(6);
        List<Appointment> appointments;
        
        if (doctorId != null) {
            appointments = repository.findByDoctorAndDateRange(doctorId, weekStart, weekEnd);
        } else {
            appointments = repository.findByDateRange(weekStart, weekEnd);
        }
        
        CalendarViewDto view = new CalendarViewDto();
        view.setStartDate(weekStart);
        view.setEndDate(weekEnd);
        view.setViewType("WEEK");
        
        List<AppointmentDto> appointmentDtos = appointments.stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .collect(Collectors.toList());
        
        view.setAppointments(appointmentDtos);
        
        // Group by date
        Map<LocalDate, List<AppointmentDto>> byDate = appointmentDtos.stream()
                .collect(Collectors.groupingBy(AppointmentDto::getAppointmentDate));
        view.setAppointmentsByDate(byDate);
        
        return view;
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarViewDto getMonthView(LocalDate monthStart, Long doctorId) {
        LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
        List<Appointment> appointments;
        
        if (doctorId != null) {
            appointments = repository.findByDoctorAndDateRange(doctorId, monthStart, monthEnd);
        } else {
            appointments = repository.findByDateRange(monthStart, monthEnd);
        }
        
        CalendarViewDto view = new CalendarViewDto();
        view.setStartDate(monthStart);
        view.setEndDate(monthEnd);
        view.setViewType("MONTH");
        
        List<AppointmentDto> appointmentDtos = appointments.stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .collect(Collectors.toList());
        
        view.setAppointments(appointmentDtos);
        
        // Group by date
        Map<LocalDate, List<AppointmentDto>> byDate = appointmentDtos.stream()
                .collect(Collectors.groupingBy(AppointmentDto::getAppointmentDate));
        view.setAppointmentsByDate(byDate);
        
        return view;
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarViewDto getDayView(LocalDate date, Long doctorId) {
        List<Appointment> appointments;
        
        if (doctorId != null) {
            appointments = repository.findByDoctorIdAndAppointmentDate(doctorId, date);
        } else {
            appointments = repository.findByAppointmentDate(date);
        }
        
        CalendarViewDto view = new CalendarViewDto();
        view.setStartDate(date);
        view.setEndDate(date);
        view.setViewType("DAY");
        
        List<AppointmentDto> appointmentDtos = appointments.stream()
                .map(entity -> {
                    AppointmentDto dto = mapper.toDto(entity);
                    populateNames(entity, dto);
                    return dto;
                })
                .sorted(Comparator.comparing(AppointmentDto::getAppointmentTime))
                .collect(Collectors.toList());
        
        view.setAppointments(appointmentDtos);
        
        // Group by date (single date for day view)
        Map<LocalDate, List<AppointmentDto>> byDate = new HashMap<>();
        byDate.put(date, appointmentDtos);
        view.setAppointmentsByDate(byDate);
        
        return view;
    }

    @Override
    @Transactional(readOnly = true)
    public List<TimeSlotDto> getAvailableTimeSlots(LocalDate date, Long doctorId, Integer slotDurationMinutes) {
        if (slotDurationMinutes == null) {
            slotDurationMinutes = 30; // Default 30 minutes
        }
        
        // Get existing appointments for the day
        List<Appointment> existingAppointments;
        if (doctorId != null) {
            existingAppointments = repository.findByDoctorIdAndAppointmentDate(doctorId, date);
        } else {
            existingAppointments = repository.findByAppointmentDate(date);
        }
        
        // Define working hours (8 AM to 6 PM)
        LocalTime workStart = LocalTime.of(8, 0);
        LocalTime workEnd = LocalTime.of(18, 0);
        
        List<TimeSlotDto> slots = new ArrayList<>();
        LocalTime currentTime = workStart;
        
        while (currentTime.plusMinutes(slotDurationMinutes).isBefore(workEnd) || 
               currentTime.plusMinutes(slotDurationMinutes).equals(workEnd)) {
            LocalTime slotEnd = currentTime.plusMinutes(slotDurationMinutes);
            
            TimeSlotDto slot = new TimeSlotDto();
            slot.setStartTime(currentTime);
            slot.setEndTime(slotEnd);
            
            // Check if this slot conflicts with existing appointments
            boolean isAvailable = true;
            for (Appointment apt : existingAppointments) {
                LocalTime aptStart = apt.getAppointmentTime();
                LocalTime aptEnd = apt.getEndTime() != null ? apt.getEndTime() : aptStart.plusMinutes(
                    apt.getDurationMinutes() != null ? apt.getDurationMinutes() : 30
                );
                
                // Check for overlap
                if (!(slotEnd.isBefore(aptStart) || slotEnd.equals(aptStart) || 
                      currentTime.isAfter(aptEnd) || currentTime.equals(aptEnd))) {
                    isAvailable = false;
                    slot.setReason("Conflicts with existing appointment");
                    break;
                }
            }
            
            slot.setAvailable(isAvailable);
            slots.add(slot);
            
            currentTime = currentTime.plusMinutes(slotDurationMinutes);
        }
        
        return slots;
    }

    @Override
    @Transactional(readOnly = true)
    public Boolean isTimeSlotAvailable(LocalDate date, LocalTime startTime, LocalTime endTime, Long doctorId) {
        List<Appointment> conflicting = repository.findConflictingAppointments(doctorId, date, startTime, endTime);
        return conflicting.isEmpty();
    }
}

