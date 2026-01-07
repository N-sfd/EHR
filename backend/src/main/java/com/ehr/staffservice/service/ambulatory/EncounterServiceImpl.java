package com.ehr.staffservice.service.ambulatory;

import com.ehr.staffservice.dto.ambulatory.EncounterDto;
import com.ehr.staffservice.entity.ambulatory.Encounter;
import com.ehr.staffservice.entity.scheduling.Appointment;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ambulatory.AmbulatoryEncounterMapper;
import com.ehr.staffservice.repository.ambulatory.AmbulatoryEncounterRepository;
import com.ehr.staffservice.repository.scheduling.SchedulingAppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("ambulatoryEncounterServiceImpl")
@RequiredArgsConstructor
public class EncounterServiceImpl implements EncounterService {
    private final AmbulatoryEncounterRepository encounterRepository;
    private final SchedulingAppointmentRepository appointmentRepository;
    private final AmbulatoryEncounterMapper encounterMapper;

    @Override
    @Transactional
    public EncounterDto createEncounterFromAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id: " + appointmentId));
        
        // Check if encounter already exists
        encounterRepository.findByAppointmentId(appointmentId).ifPresent(encounter -> {
            throw new IllegalStateException("Encounter already exists for appointment: " + appointmentId);
        });
        
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
        Encounter encounter = encounterRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + id));
        
        // Update status if provided
        if (dto.getStatus() != null) {
            encounter.setStatus(Encounter.EncounterStatus.valueOf(dto.getStatus()));
        }
        
        // Use mapper to update other fields
        encounterMapper.updateEntityFromDto(dto, encounter);
        
        Encounter saved = encounterRepository.save(encounter);
        return encounterMapper.toDto(saved);
    }
}

