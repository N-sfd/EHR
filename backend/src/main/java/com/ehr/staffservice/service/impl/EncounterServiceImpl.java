package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.EncounterDto;
import com.ehr.staffservice.entity.Encounter;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.EncounterMapper;
import com.ehr.staffservice.repository.EncounterRepository;
import com.ehr.staffservice.service.EncounterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EncounterServiceImpl implements EncounterService {

    private final EncounterRepository repository;
    private final EncounterMapper mapper;

    @Override
    @Transactional
    public EncounterDto create(EncounterDto dto) {
        Encounter entity = mapper.toEntity(dto);
        if (entity.getEncounterNumber() == null) {
            entity.setEncounterNumber("ENC" + System.currentTimeMillis());
        }
        if (entity.getEncounterStatus() == null) {
            entity.setEncounterStatus(Encounter.EncounterStatus.SCHEDULED);
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public EncounterDto update(Long id, EncounterDto dto) {
        Encounter entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public EncounterDto get(Long id) {
        Encounter entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public EncounterDto getByEncounterNumber(String encounterNumber) {
        Encounter entity = repository.findByEncounterNumber(encounterNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with number: " + encounterNumber));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Encounter not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<EncounterDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EncounterDto> getByPatientIdAndStatus(Long patientId, String status) {
        Encounter.EncounterStatus encounterStatus = Encounter.EncounterStatus.valueOf(status.toUpperCase());
        return repository.findByPatientIdAndEncounterStatus(patientId, encounterStatus).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EncounterDto> getByAppointmentId(Long appointmentId) {
        return repository.findByAppointmentId(appointmentId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EncounterDto checkIn(Long encounterId, Long staffId) {
        Encounter entity = repository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        entity.setEncounterStatus(Encounter.EncounterStatus.CHECKED_IN);
        entity.setCheckInDateTime(LocalDateTime.now());
        entity.setCheckInByStaffId(staffId);
        if (entity.getArrivalDateTime() == null) {
            entity.setArrivalDateTime(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public EncounterDto checkOut(Long encounterId, Long staffId) {
        Encounter entity = repository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        entity.setEncounterStatus(Encounter.EncounterStatus.CHECKED_OUT);
        entity.setCheckOutDateTime(LocalDateTime.now());
        entity.setCheckOutByStaffId(staffId);
        if (entity.getCheckInDateTime() != null) {
            long minutes = java.time.Duration.between(entity.getCheckInDateTime(), LocalDateTime.now()).toMinutes();
            entity.setVisitDurationMinutes((int) minutes);
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public EncounterDto completeRegistration(Long encounterId, Long staffId) {
        Encounter entity = repository.findById(encounterId)
                .orElseThrow(() -> new ResourceNotFoundException("Encounter not found with id: " + encounterId));
        entity.setRegistrationComplete(true);
        entity.setRegistrationCompleteDate(LocalDateTime.now());
        entity.setRegistrationCompleteByStaffId(staffId);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

