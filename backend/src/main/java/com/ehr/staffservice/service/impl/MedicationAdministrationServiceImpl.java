package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.MedicationAdministrationDto;
import com.ehr.staffservice.entity.MedicationAdministration;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.MedicationAdministrationMapper;
import com.ehr.staffservice.repository.MedicationAdministrationRepository;
import com.ehr.staffservice.service.MedicationAdministrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationAdministrationServiceImpl implements MedicationAdministrationService {

    private final MedicationAdministrationRepository repository;
    private final MedicationAdministrationMapper mapper;

    @Override
    @Transactional
    public MedicationAdministrationDto create(MedicationAdministrationDto dto) {
        MedicationAdministration entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("SCHEDULED");
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public MedicationAdministrationDto update(Long id, MedicationAdministrationDto dto) {
        MedicationAdministration entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication administration not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public MedicationAdministrationDto get(Long id) {
        MedicationAdministration entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication administration not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Medication administration not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<MedicationAdministrationDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByScheduledTimeDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationDto> getByMedicationId(Long medicationId) {
        return repository.findByMedicationIdOrderByScheduledTimeDesc(medicationId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationAdministrationDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByScheduledTimeAsc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicationAdministrationDto administerMedication(Long id, Long staffId) {
        MedicationAdministration entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication administration not found with id: " + id));
        entity.setStatus("GIVEN");
        entity.setAdministeredTime(LocalDateTime.now());
        entity.setAdministeredByStaffId(staffId);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public MedicationAdministrationDto holdMedication(Long id, String reason) {
        MedicationAdministration entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication administration not found with id: " + id));
        entity.setStatus("HELD");
        entity.setReasonHeld(reason);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public MedicationAdministrationDto refuseMedication(Long id, String reason) {
        MedicationAdministration entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication administration not found with id: " + id));
        entity.setStatus("REFUSED");
        entity.setReasonRefused(reason);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

