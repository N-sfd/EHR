package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.LabResultDto;
import java.util.List;

public interface LabResultService {
    LabResultDto create(LabResultDto dto);
    LabResultDto update(Long id, LabResultDto dto);
    LabResultDto get(Long id);
    void delete(Long id);
    List<LabResultDto> getByPatientId(Long patientId);
    List<LabResultDto> getByPatientIdAndStatus(Long patientId, String status);
    List<LabResultDto> getByPatientIdAndCategory(Long patientId, String category);
    List<LabResultDto> getCriticalResults();
    LabResultDto markCriticalAsNotified(Long id, Long staffId);
}

