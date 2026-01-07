package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.PatientDemographicsDto;
import com.ehr.staffservice.entity.PatientDemographics;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.PatientDemographicsMapper;
import com.ehr.staffservice.repository.PatientDemographicsRepository;
import com.ehr.staffservice.service.PatientDemographicsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PatientDemographicsServiceImpl implements PatientDemographicsService {

    private final PatientDemographicsRepository repository;
    private final PatientDemographicsMapper mapper;

    @Override
    @Transactional
    public PatientDemographicsDto createOrUpdate(PatientDemographicsDto dto) {
        Optional<PatientDemographics> existing = repository.findByPatientId(dto.getPatientId());
        if (existing.isPresent()) {
            PatientDemographics entity = existing.get();
            mapper.updateEntityFromDto(dto, entity);
            entity = repository.save(entity);
            return mapper.toDto(entity);
        } else {
            PatientDemographics entity = mapper.toEntity(dto);
            entity = repository.save(entity);
            return mapper.toDto(entity);
        }
    }

    @Override
    public Optional<PatientDemographicsDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId)
                .map(mapper::toDto);
    }

    @Override
    @Transactional
    public PatientDemographicsDto update(Long id, PatientDemographicsDto dto) {
        PatientDemographics entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient demographics not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Patient demographics not found with id: " + id);
        }
        repository.deleteById(id);
    }
}

