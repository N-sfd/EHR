package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.MedicationDto;
import com.ehr.staffservice.entity.Medication;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.MedicationMapper;
import com.ehr.staffservice.repository.MedicationRepository;
import com.ehr.staffservice.service.MedicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicationServiceImpl implements MedicationService {

    private final MedicationRepository repository;
    private final MedicationMapper mapper;

    @Override
    @Transactional
    public MedicationDto create(MedicationDto dto) {
        Medication entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("ACTIVE");
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public MedicationDto update(Long id, MedicationDto dto) {
        Medication entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public MedicationDto get(Long id) {
        Medication entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medication not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Medication not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<MedicationDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByStartDateDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByStartDateDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<MedicationDto> getActiveMedications(Long patientId) {
        return getByPatientIdAndStatus(patientId, "ACTIVE");
    }
}

