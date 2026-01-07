package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.VitalSignDto;
import java.util.List;

public interface VitalSignService {
    VitalSignDto create(VitalSignDto dto);
    VitalSignDto update(Long id, VitalSignDto dto);
    VitalSignDto get(Long id);
    void delete(Long id);
    List<VitalSignDto> getByPatientId(Long patientId);
    VitalSignDto getLatestByPatientId(Long patientId);
}

