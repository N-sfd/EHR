package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ServiceDto;
import com.ehr.staffservice.entity.Service;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ServiceMapper;
import com.ehr.staffservice.repository.ServiceRepository;
import com.ehr.staffservice.service.ServiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class ServiceServiceImpl implements ServiceService {

    private final ServiceRepository repository;
    private final ServiceMapper mapper;

    @Override
    @Transactional
    public ServiceDto create(ServiceDto dto) {
        Service entity = mapper.toEntity(dto);
        entity.setServiceId(null); // ensure insert
        Service saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public ServiceDto update(Long id, ServiceDto dto) {
        Service existing = Objects.requireNonNull(
                repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Service not found")),
                "Service must not be null"
        );

        mapper.updateEntityFromDto(dto, existing);
        Service saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public ServiceDto get(Long id) {
        Service entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found"));
        ServiceDto dto = mapper.toDto(entity);
        // Note: Department relationship is lazy-loaded, so we don't access it directly here
        // The department name should be populated by the mapper or via a join query if needed
        return dto;
    }

    @Override
    public List<ServiceDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Service not found");
        }
        repository.deleteById(id);
    }
}

