package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ProviderEncounterDto;
import com.ehr.staffservice.entity.ProviderEncounter;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ProviderEncounterMapper;
import com.ehr.staffservice.repository.ProviderEncounterRepository;
import com.ehr.staffservice.service.ProviderEncounterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProviderEncounterServiceImpl implements ProviderEncounterService {

    private final ProviderEncounterRepository repository;
    private final ProviderEncounterMapper mapper;

    @Override
    @Transactional
    public ProviderEncounterDto create(ProviderEncounterDto dto) {
        ProviderEncounter entity = mapper.toEntity(dto);
        if (entity.getEncounterDateTime() == null) {
            entity.setEncounterDateTime(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ProviderEncounterDto update(Long id, ProviderEncounterDto dto) {
        ProviderEncounter entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider encounter not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ProviderEncounterDto get(Long id) {
        ProviderEncounter entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider encounter not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public Optional<ProviderEncounterDto> getByEncounterId(Long encounterId) {
        return repository.findByEncounterId(encounterId).map(mapper::toDto);
    }

    @Override
    @Transactional
    public ProviderEncounterDto sign(Long id, Long staffId) {
        ProviderEncounter entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider encounter not found with id: " + id));
        entity.setIsSigned(true);
        entity.setSignedDateTime(LocalDateTime.now());
        entity.setSignedByStaffId(staffId);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ProviderEncounterDto complete(Long id) {
        ProviderEncounter entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider encounter not found with id: " + id));
        entity.setIsComplete(true);
        entity.setCompletedDateTime(LocalDateTime.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

