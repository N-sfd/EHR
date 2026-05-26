package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.DepartmentDto;
import com.ehr.staffservice.entity.Department;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Scheduling Department Service
 * Uses canonical Department entity (departments table)
 * Maps to scheduling.DepartmentDto for API compatibility
 */
@Service("schedulingDepartmentServiceImpl")
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository; // Use canonical repository

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::toSchedulingDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findAll().stream()
                .filter(d -> "ACTIVE".equalsIgnoreCase(d.getStatus()))
                .map(this::toSchedulingDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        if (id == null) {
            throw new ResourceNotFoundException("Department id cannot be null");
        }
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return toSchedulingDto(department);
    }

    /**
     * Map canonical Department entity to scheduling.DepartmentDto
     */
    private DepartmentDto toSchedulingDto(Department department) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(department.getDepartmentId());
        dto.setName(department.getName());
        dto.setLocation(null); // Canonical Department doesn't have location field
        dto.setIsActive("ACTIVE".equalsIgnoreCase(department.getStatus()));
        return dto;
    }
}

