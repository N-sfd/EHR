package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.AllergyDto;
import java.util.List;

public interface AllergyService {
    AllergyDto create(AllergyDto dto);
    AllergyDto update(Long id, AllergyDto dto);
    AllergyDto get(Long id);
    void delete(Long id);
    List<AllergyDto> getByPatientId(Long patientId);
    List<AllergyDto> getByPatientIdAndStatus(Long patientId, String status);
}

