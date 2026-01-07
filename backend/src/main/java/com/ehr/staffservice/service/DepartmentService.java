package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.DepartmentDto;
import java.util.List;

public interface DepartmentService {
    DepartmentDto create(DepartmentDto dto);
    DepartmentDto update(Long id, DepartmentDto dto);
    DepartmentDto get(Long id);
    List<DepartmentDto> getAll();
    void delete(Long id);
}

