package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.PermissionDto;
import com.ehr.staffservice.entity.Permission;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.PermissionMapper;
import com.ehr.staffservice.repository.PermissionRepository;
import com.ehr.staffservice.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionServiceImpl implements PermissionService {

    private final PermissionRepository repository;
    private final PermissionMapper mapper;

    @Override
    public PermissionDto create(PermissionDto dto) {
        Permission entity = mapper.toEntity(dto);
        entity.setPermissionId(null);
        Permission saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public PermissionDto update(Long id, PermissionDto dto) {
        Permission existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));

        mapper.updateEntityFromDto(dto, existing);
        Permission saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public PermissionDto get(Long id) {
        Permission entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission not found"));
        return mapper.toDto(entity);
    }

    @Override
    public List<PermissionDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Permission not found");
        }
        repository.deleteById(id);
    }
}

