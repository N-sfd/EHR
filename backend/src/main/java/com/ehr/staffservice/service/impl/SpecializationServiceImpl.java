package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.SpecializationDto;
import com.ehr.staffservice.entity.Specialization;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.SpecializationMapper;
import com.ehr.staffservice.repository.DepartmentRepository;
import com.ehr.staffservice.repository.SpecializationRepository;
import com.ehr.staffservice.service.SpecializationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SpecializationServiceImpl implements SpecializationService {

    private final SpecializationRepository repository;
    private final DepartmentRepository departmentRepository;
    private final SpecializationMapper mapper;

    @Override
    public SpecializationDto create(SpecializationDto dto) {
        Specialization entity = mapper.toEntity(dto);
        entity.setSpecializationId(null);
        
        // Set department if provided
        if (dto.getDepartmentId() != null) {
            departmentRepository.findById(dto.getDepartmentId())
                    .ifPresent(entity::setDepartment);
        }
        
        Specialization saved = repository.save(entity);
        return mapper.toDto(saved);
    }

    @Override
    public SpecializationDto update(Long id, SpecializationDto dto) {
        Specialization existing = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));

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
        
        Specialization saved = repository.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public SpecializationDto get(Long id) {
        Specialization entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Specialization not found"));
        return mapper.toDto(entity);
    }

    @Override
    public List<SpecializationDto> getAll() {
        return repository.findAll()
                .stream()
                .map(mapper::toDto)
                .toList();
    }

    @Override
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Specialization not found");
        }
        repository.deleteById(id);
    }
}

