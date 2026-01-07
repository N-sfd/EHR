package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ImmunizationDto;
import com.ehr.staffservice.entity.Immunization;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ImmunizationMapper;
import com.ehr.staffservice.repository.ImmunizationRepository;
import com.ehr.staffservice.service.ImmunizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImmunizationServiceImpl implements ImmunizationService {

    private final ImmunizationRepository repository;
    private final ImmunizationMapper mapper;

    @Override
    @Transactional
    public ImmunizationDto create(ImmunizationDto dto) {
        Immunization entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus(Immunization.ImmunizationStatus.COMPLETED);
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ImmunizationDto update(Long id, ImmunizationDto dto) {
        Immunization entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Immunization not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ImmunizationDto get(Long id) {
        Immunization entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Immunization not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Immunization not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ImmunizationDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImmunizationDto> getByPatientIdAndStatus(Long patientId, String status) {
        Immunization.ImmunizationStatus immunizationStatus = Immunization.ImmunizationStatus.valueOf(status.toUpperCase());
        return repository.findByPatientIdAndStatus(patientId, immunizationStatus).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImmunizationDto> getByPatientIdAndDateRange(Long patientId, LocalDate startDate, LocalDate endDate) {
        return repository.findByPatientIdAndDateRange(patientId, startDate, endDate).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImmunizationDto> getByPatientIdAndVaccineName(Long patientId, String vaccineName) {
        return repository.findByPatientIdAndVaccineName(patientId, vaccineName).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}

