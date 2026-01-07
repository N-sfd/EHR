package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.VitalSignDto;
import com.ehr.staffservice.entity.VitalSign;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.VitalSignMapper;
import com.ehr.staffservice.repository.VitalSignRepository;
import com.ehr.staffservice.service.VitalSignService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VitalSignServiceImpl implements VitalSignService {

    private final VitalSignRepository repository;
    private final VitalSignMapper mapper;

    @Override
    @Transactional
    public VitalSignDto create(VitalSignDto dto) {
        VitalSign entity = mapper.toEntity(dto);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public VitalSignDto update(Long id, VitalSignDto dto) {
        VitalSign entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vital sign not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public VitalSignDto get(Long id) {
        VitalSign entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vital sign not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Vital sign not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<VitalSignDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByRecordedAtDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public VitalSignDto getLatestByPatientId(Long patientId) {
        VitalSign entity = repository.findFirstByPatientIdOrderByRecordedAtDesc(patientId);
        if (entity == null) {
            throw new ResourceNotFoundException("No vital signs found for patient id: " + patientId);
        }
        return mapper.toDto(entity);
    }
}

