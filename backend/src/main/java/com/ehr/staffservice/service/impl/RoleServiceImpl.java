package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.RoleDto;
import com.ehr.staffservice.entity.Role;
import com.ehr.staffservice.exception.DuplicateResourceException;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.RoleMapper;
import com.ehr.staffservice.repository.RoleRepository;
import com.ehr.staffservice.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;
    private final RoleMapper mapper;

    @Override
    public RoleDto create(RoleDto dto) {
        // Check for duplicate name
        if (dto.getName() != null && repository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Role with name '" + dto.getName() + "' already exists");
        }
        
        // Check for duplicate code if provided
        if (dto.getCode() != null && !dto.getCode().isEmpty() && repository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Role with code '" + dto.getCode() + "' already exists");
        }
        
        Role entity = mapper.toEntity(dto);
        entity.setRoleId(null);
        Role saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public RoleDto update(Long id, RoleDto dto) {
        Role existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        // Check for duplicate name (excluding current role)
        if (dto.getName() != null && !dto.getName().equals(existing.getName())) {
            if (repository.existsByName(dto.getName())) {
                throw new DuplicateResourceException("Role with name '" + dto.getName() + "' already exists");
            }
        }
        
        // Check for duplicate code (excluding current role)
        if (dto.getCode() != null && !dto.getCode().isEmpty() && !dto.getCode().equals(existing.getCode())) {
            if (repository.existsByCode(dto.getCode())) {
                throw new DuplicateResourceException("Role with code '" + dto.getCode() + "' already exists");
            }
        }

        mapper.updateEntityFromDto(dto, existing);
        Role saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public RoleDto get(Long id) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        return mapper.toDto(entity);
    }

    @Override
    public List<RoleDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Role not found");
        }
        repository.deleteById(id);
    }
}

