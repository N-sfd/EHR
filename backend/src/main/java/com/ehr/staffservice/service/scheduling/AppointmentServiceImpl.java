package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.AppointmentRequestDto;
import com.ehr.staffservice.dto.scheduling.AppointmentResponseDto;
import com.ehr.staffservice.entity.scheduling.Appointment;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.repository.patientaccess.PatientAccessPatientRepository;
import com.ehr.staffservice.repository.scheduling.SchedulingAppointmentRepository;
import com.ehr.staffservice.repository.scheduling.SchedulingDepartmentRepository;
import com.ehr.staffservice.repository.scheduling.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service("schedulingAppointmentServiceImpl")
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {
    private final SchedulingAppointmentRepository appointmentRepository;
    private final PatientAccessPatientRepository patientRepository;
    private final ProviderRepository providerRepository;
    private final SchedulingDepartmentRepository departmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointmentsByDate(LocalDate date) {
        List<Appointment> appointments = appointmentRepository.findByDate(date);
        return appointments.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointmentsByDateAndProvider(LocalDate date, Long providerId) {
        List<Appointment> appointments = appointmentRepository.findByDateAndProvider(date, providerId);
        return appointments.stream()
                .map(this::toResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentRequestDto dto) {
        // Validate patient exists
        patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + dto.getPatientId()));
        
        // Validate provider exists
        providerRepository.findById(dto.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + dto.getProviderId()));
        
        // Check for conflicts
        List<Appointment> conflicts = appointmentRepository.findConflictingAppointments(
                dto.getProviderId(),
                dto.getStartDateTime(),
                dto.getStartDateTime().plusMinutes(dto.getDurationMins())
        );
        
        if (!conflicts.isEmpty()) {
            throw new IllegalStateException("Appointment conflicts with existing appointment");
        }
        
        Appointment appointment = new Appointment();
        appointment.setPatientId(dto.getPatientId());
        appointment.setProviderId(dto.getProviderId());
        appointment.setDepartmentId(dto.getDepartmentId());
        appointment.setVisitTypeId(dto.getVisitTypeId());
        appointment.setStartDateTime(dto.getStartDateTime());
        appointment.setDurationMins(dto.getDurationMins());
        appointment.setStatus(Appointment.AppointmentStatus.SCHEDULED);
        appointment.setReason(dto.getReason());
        appointment.setNotes(dto.getNotes());
        
        Appointment saved = appointmentRepository.save(appointment);
        return toResponseDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto cancelAppointment(Long id, String reason) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        
        appointment.setStatus(Appointment.AppointmentStatus.CANCELED);
        if (reason != null) {
            appointment.setNotes((appointment.getNotes() != null ? appointment.getNotes() + "\n" : "") + 
                    "Cancellation reason: " + reason);
        }
        
        Appointment saved = appointmentRepository.save(appointment);
        return toResponseDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto updateAppointmentStatus(Long id, String status) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + id));
        
        // Map string status to enum
        Appointment.AppointmentStatus statusEnum;
        switch (status.toUpperCase()) {
            case "ARRIVED":
                statusEnum = Appointment.AppointmentStatus.ARRIVED;
                break;
            case "CHECKED_IN":
            case "CHECKEDIN":
                statusEnum = Appointment.AppointmentStatus.CHECKED_IN;
                break;
            case "SCHEDULED":
                statusEnum = Appointment.AppointmentStatus.SCHEDULED;
                break;
            case "CANCELED":
            case "CANCELLED":
                statusEnum = Appointment.AppointmentStatus.CANCELED;
                break;
            case "COMPLETED":
                statusEnum = Appointment.AppointmentStatus.COMPLETED;
                break;
            case "IN_PROGRESS":
                statusEnum = Appointment.AppointmentStatus.IN_PROGRESS;
                break;
            default:
                throw new IllegalArgumentException("Invalid status: " + status);
        }
        
        appointment.setStatus(statusEnum);
        Appointment saved = appointmentRepository.save(appointment);
        return toResponseDto(saved);
    }

    private AppointmentResponseDto toResponseDto(Appointment appointment) {
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(appointment.getId());
        dto.setPatientId(appointment.getPatientId());
        dto.setProviderId(appointment.getProviderId());
        dto.setDepartmentId(appointment.getDepartmentId());
        dto.setVisitTypeId(appointment.getVisitTypeId());
        dto.setStartDateTime(appointment.getStartDateTime());
        dto.setDurationMins(appointment.getDurationMins());
        dto.setStatus(appointment.getStatus().name());
        dto.setReason(appointment.getReason());
        dto.setNotes(appointment.getNotes());
        
        // Populate patient info
        if (appointment.getPatientId() != null) {
            patientRepository.findById(appointment.getPatientId()).ifPresent(patient -> {
                dto.setPatientName(patient.getFirstName() + " " + patient.getLastName());
                dto.setPatientMrn(patient.getMrn());
            });
        }
        
        // Populate provider info
        if (appointment.getProvider() != null) {
            dto.setProviderName(appointment.getProvider().getFirstName() + " " + appointment.getProvider().getLastName());
        } else if (appointment.getProviderId() != null) {
            providerRepository.findById(appointment.getProviderId()).ifPresent(provider -> {
                dto.setProviderName(provider.getFirstName() + " " + provider.getLastName());
            });
        }
        
        // Populate department info
        if (appointment.getDepartment() != null) {
            dto.setDepartmentName(appointment.getDepartment().getName());
        } else if (appointment.getDepartmentId() != null) {
            departmentRepository.findById(appointment.getDepartmentId()).ifPresent(dept -> {
                dto.setDepartmentName(dept.getName());
            });
        }
        
        return dto;
    }
}

