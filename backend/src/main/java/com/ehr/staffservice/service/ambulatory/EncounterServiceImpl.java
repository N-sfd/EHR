package com.ehr.staffservice.service.ambulatory;

import com.ehr.staffservice.dto.ambulatory.EncounterDto;
import com.ehr.staffservice.entity.ambulatory.Encounter;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ambulatory.AmbulatoryEncounterMapper;
import com.ehr.staffservice.repository.ambulatory.AmbulatoryEncounterRepository;
import com.ehr.staffservice.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service("ambulatoryEncounterServiceImpl")
@RequiredArgsConstructor
public class EncounterServiceImpl implements EncounterService {
    private final AmbulatoryEncounterRepository encounterRepository;
    private final AppointmentRepository appointmentRepository;
    private final AmbulatoryEncounterMapper encounterMapper;

    @Override
    @Transactional
    public EncounterDto createEncounterFromAppointment(Long appointmentId) {
        if (appointmentId == null) {
            throw new IllegalArgumentException("Appointment ID cannot be null");
        }
        
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Check if encounter already exists
        encounterRepository.findByAppointmentId(appointmentId).ifPresent(encounter -> {
            throw new IllegalStateException("Encounter already exists for appointment: " + appointmentId);
        });
        
        if (appointment.getPatientId() == null) {
            throw new IllegalStateException("Appointment must have a patient ID");
        }
        
        Encounter encounter = new Encounter();
        encounter.setAppointmentId(appointmentId);
        encounter.setPatientId(appointment.getPatientId());
        encounter.setStatus(Encounter.EncounterStatus.ROOMING);
        
        Encounter saved = encounterRepository.save(encounter);
        return encounterMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public EncounterDto getEncounterById(Long id) {
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + id));
        return encounterMapper.toDto(encounter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EncounterDto> getEncountersByPatientId(Long patientId) {
        List<Encounter> encounters = encounterRepository.findByPatientId(patientId);
        return encounters.stream()
                .map(encounterMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EncounterDto updateEncounter(Long id, EncounterDto dto) {
        if (id == null) {
            throw new IllegalArgumentException("Encounter ID cannot be null");
        }
        if (dto == null) {
            throw new IllegalArgumentException("Encounter DTO cannot be null");
        }
        
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + id));
        
        // Update status if provided
        if (dto.getStatus() != null && !dto.getStatus().trim().isEmpty()) {
            try {
                Encounter.EncounterStatus newStatus = Encounter.EncounterStatus.valueOf(dto.getStatus().toUpperCase().trim());
                encounter.setStatus(newStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid encounter status: " + dto.getStatus());
            }
        }
        
        // Use mapper to update other fields
        encounterMapper.updateEntityFromDto(dto, encounter);
        
        Encounter saved = encounterRepository.save(encounter);
        return encounterMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EncounterDto> getAllEncounters() {
        List<Encounter> encounters = encounterRepository.findAll();
        return encounters.stream()
                .map(encounterMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EncounterDto updateEncounterStatus(Long id, String status) {
        if (id == null) {
            throw new IllegalArgumentException("Encounter ID cannot be null");
        }
        if (status == null || status.trim().isEmpty()) {
            throw new IllegalArgumentException("Status cannot be null or empty");
        }
        
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + id));
        
        try {
            Encounter.EncounterStatus newStatus = Encounter.EncounterStatus.valueOf(status.toUpperCase().trim());
            
            // Validate status transition (optional - can be enhanced with state machine)
            Encounter.EncounterStatus currentStatus = encounter.getStatus();
            if (currentStatus == Encounter.EncounterStatus.COMPLETED && newStatus != Encounter.EncounterStatus.COMPLETED) {
                throw new IllegalStateException("Cannot change status from COMPLETED to " + newStatus);
            }
            
            encounter.setStatus(newStatus);
            Encounter saved = encounterRepository.save(encounter);
            return encounterMapper.toDto(saved);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid encounter status: " + status + ". Valid values are: ROOMING, PROVIDER_ENCOUNTER, CHECKOUT, COMPLETED");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EncounterDto> getEncounterByAppointmentId(Long appointmentId) {
        return encounterRepository.findByAppointmentId(appointmentId)
                .map(encounterMapper::toDto);
    }
}

