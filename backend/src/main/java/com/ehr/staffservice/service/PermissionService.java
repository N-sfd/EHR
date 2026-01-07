package com.ehr.staffservice.service; 

import com.ehr.staffservice.dto.PermissionDto;
import java.util.List;

public interface PermissionService {
    List<PermissionDto> getAll();
    PermissionDto get(Long id);
    PermissionDto create(PermissionDto dto);
    PermissionDto update(Long id, PermissionDto dto);
    void delete(Long id);
}

