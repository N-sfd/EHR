package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.DesignationDto;
import java.util.List;

public interface DesignationService {
    DesignationDto create(DesignationDto dto);
    DesignationDto update(Long id, DesignationDto dto);
    DesignationDto get(Long id);
    List<DesignationDto> getAll();
    void delete(Long id);
}

