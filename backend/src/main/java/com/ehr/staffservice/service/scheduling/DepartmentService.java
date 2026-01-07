package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.DepartmentDto;
import java.util.List;

public interface DepartmentService {
    List<DepartmentDto> getAllDepartments();
    List<DepartmentDto> getActiveDepartments();
    DepartmentDto getDepartmentById(Long id);
}

