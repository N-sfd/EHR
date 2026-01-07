package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.AllergyDto;
import com.ehr.staffservice.entity.Allergy;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.AllergyMapper;
import com.ehr.staffservice.repository.AllergyRepository;
import com.ehr.staffservice.service.AllergyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AllergyServiceImpl implements AllergyService {

    private final AllergyRepository repository;
    private final AllergyMapper mapper;

    @Override
    @Transactional
    public AllergyDto create(AllergyDto dto) {
        Allergy entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("ACTIVE");
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public AllergyDto update(Long id, AllergyDto dto) {
        Allergy entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public AllergyDto get(Long id) {
        Allergy entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Allergy not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Allergy not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<AllergyDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByOnsetDateDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AllergyDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByOnsetDateDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}

