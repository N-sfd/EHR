package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.DesignationDto;
import com.ehr.staffservice.entity.Designation;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.DesignationMapper;
import com.ehr.staffservice.repository.DesignationRepository;
import com.ehr.staffservice.repository.DepartmentRepository;
import com.ehr.staffservice.service.DesignationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DesignationServiceImpl implements DesignationService {

    private final DesignationRepository repository;
    private final DepartmentRepository departmentRepository;
    private final DesignationMapper mapper;

    @Override
    public DesignationDto create(DesignationDto dto) {
        Designation entity = mapper.toEntity(dto);
        entity.setDesignationId(null);
        
        // Set department if provided
        if (dto.getDepartmentId() != null) {
            departmentRepository.findById(dto.getDepartmentId())
                    .ifPresent(entity::setDepartment);
        }
        
        Designation saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public DesignationDto update(Long id, DesignationDto dto) {
        Designation existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));

        mapper.updateEntityFromDto(dto, existing);
        
        // Update department if provided
        if (dto.getDepartmentId() != null) {
            departmentRepository.findById(dto.getDepartmentId())
                    .ifPresentOrElse(
                            existing::setDepartment,
                            () -> existing.setDepartment(null)
                    );
        } else {
            existing.setDepartment(null);
        }
        
        Designation saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public DesignationDto get(Long id) {
        Designation entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Designation not found"));
        return mapper.toDto(entity);
    }

    @Override
    public List<DesignationDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Designation not found");
        }
        repository.deleteById(id);
    }
}

