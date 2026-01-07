package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.RoleDto;
import java.util.List;

public interface RoleService {
    RoleDto create(RoleDto dto);
    RoleDto update(Long id, RoleDto dto);
    RoleDto get(Long id);
    List<RoleDto> getAll();
    void delete(Long id);
}

