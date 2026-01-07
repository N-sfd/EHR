package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.DepartmentDto;
import com.ehr.staffservice.entity.scheduling.Department;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.scheduling.DepartmentMapper;
import com.ehr.staffservice.repository.scheduling.SchedulingDepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("schedulingDepartmentServiceImpl")
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final SchedulingDepartmentRepository departmentRepository;
    private final DepartmentMapper departmentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(departmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentDto> getActiveDepartments() {
        return departmentRepository.findByIsActiveTrue().stream()
                .map(departmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return departmentMapper.toDto(department);
    }
}

