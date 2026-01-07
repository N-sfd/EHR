package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ServiceDto;
import java.util.List;

public interface ServiceService {
    ServiceDto create(ServiceDto dto);
    ServiceDto update(Long id, ServiceDto dto);
    ServiceDto get(Long id);
    List<ServiceDto> getAll();
    void delete(Long id);
}

