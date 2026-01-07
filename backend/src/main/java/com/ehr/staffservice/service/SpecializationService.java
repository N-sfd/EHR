package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.SpecializationDto;
import java.util.List;

public interface SpecializationService {
    SpecializationDto create(SpecializationDto dto);
    SpecializationDto update(Long id, SpecializationDto dto);
    SpecializationDto get(Long id);
    List<SpecializationDto> getAll();
    void delete(Long id);
}

