package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.InsuranceDto;
import com.ehr.staffservice.entity.Insurance;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.InsuranceMapper;
import com.ehr.staffservice.repository.InsuranceRepository;
import com.ehr.staffservice.service.InsuranceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InsuranceServiceImpl implements InsuranceService {

    private final InsuranceRepository repository;
    private final InsuranceMapper mapper;

    @Override
    @Transactional
    public InsuranceDto create(InsuranceDto dto) {
        Insurance entity = mapper.toEntity(dto);
        if (dto.getIsPrimary() != null && dto.getIsPrimary()) {
            // Unset other primary insurances
            repository.findByPatientIdAndIsPrimaryTrue(dto.getPatientId())
                    .ifPresent(existing -> {
                        existing.setIsPrimary(false);
                        repository.save(existing);
                    });
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public InsuranceDto update(Long id, InsuranceDto dto) {
        Insurance entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        if (dto.getIsPrimary() != null && dto.getIsPrimary()) {
            repository.findByPatientIdAndIsPrimaryTrue(dto.getPatientId())
                    .ifPresent(existing -> {
                        if (!existing.getId().equals(id)) {
                            existing.setIsPrimary(false);
                            repository.save(existing);
                        }
                    });
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public InsuranceDto get(Long id) {
        Insurance entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Insurance not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Insurance not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<InsuranceDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<InsuranceDto> getActiveByPatientId(Long patientId) {
        return repository.findByPatientIdAndIsActive(patientId, true).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public Optional<InsuranceDto> getPrimaryByPatientId(Long patientId) {
        return repository.findByPatientIdAndIsPrimaryTrue(patientId)
                .map(mapper::toDto);
    }
}

