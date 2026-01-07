package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ClinicSettingsDto;
import com.ehr.staffservice.entity.ClinicSettings;
import com.ehr.staffservice.mapper.ClinicSettingsMapper;
import com.ehr.staffservice.repository.ClinicSettingsRepository;
import com.ehr.staffservice.service.ClinicSettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ClinicSettingsServiceImpl implements ClinicSettingsService {

    private final ClinicSettingsRepository repository;
    private final ClinicSettingsMapper mapper;

    @Override
    public ClinicSettingsDto get() {
        return repository.findFirstByOrderByIdAsc()
                .map(mapper::toDto)
                .orElse(null);
    }

    @Override
    @Transactional
    public ClinicSettingsDto create(ClinicSettingsDto dto) {
        // Check if settings already exist
        if (repository.findFirstByOrderByIdAsc().isPresent()) {
            throw new IllegalStateException("Clinic settings already exist. Use update instead.");
        }
        ClinicSettings entity = mapper.toEntity(dto);
        ClinicSettings saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public ClinicSettingsDto update(Long id, ClinicSettingsDto dto) {
        ClinicSettings entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Clinic settings not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        ClinicSettings updated = repository.save(entity);
        return mapper.toDto(updated);
    }
}

