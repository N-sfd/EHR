package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.InsuranceDto;
import java.util.List;
import java.util.Optional;

public interface InsuranceService {
    InsuranceDto create(InsuranceDto dto);
    InsuranceDto update(Long id, InsuranceDto dto);
    InsuranceDto get(Long id);
    void delete(Long id);
    List<InsuranceDto> getByPatientId(Long patientId);
    List<InsuranceDto> getActiveByPatientId(Long patientId);
    Optional<InsuranceDto> getPrimaryByPatientId(Long patientId);
}

