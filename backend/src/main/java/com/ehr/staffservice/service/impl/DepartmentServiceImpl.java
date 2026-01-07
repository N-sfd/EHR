package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.DepartmentDto;
import com.ehr.staffservice.entity.Department;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.DepartmentMapper;
import com.ehr.staffservice.repository.DepartmentRepository;
import com.ehr.staffservice.service.DepartmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {

    private final DepartmentRepository repository;
    private final DepartmentMapper mapper;

    @Override
    public DepartmentDto create(DepartmentDto dto) {
        Department entity = mapper.toEntity(dto);
        entity.setDepartmentId(null); // ensure insert
        Department saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public DepartmentDto update(Long id, DepartmentDto dto) {
        Department existing = Objects.requireNonNull(
                repository.findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found")),
                "Department must not be null"
        );

        mapper.updateEntityFromDto(dto, existing);
        Department saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public DepartmentDto get(Long id) {
        Department entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
        return mapper.toDto(entity);
    }

    @Override
    public List<DepartmentDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found");
        }
        repository.deleteById(id);
    }
}

