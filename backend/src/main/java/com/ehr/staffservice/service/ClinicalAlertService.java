package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ClinicalAlertDto;
import java.util.List;

public interface ClinicalAlertService {
    ClinicalAlertDto create(ClinicalAlertDto dto);
    ClinicalAlertDto update(Long id, ClinicalAlertDto dto);
    ClinicalAlertDto get(Long id);
    void delete(Long id);
    List<ClinicalAlertDto> getByPatientId(Long patientId);
    List<ClinicalAlertDto> getActiveAlertsByPatientId(Long patientId);
    List<ClinicalAlertDto> getActiveAlerts();
    List<ClinicalAlertDto> getByStatus(String status);
    ClinicalAlertDto acknowledge(Long id, Long staffId);
    ClinicalAlertDto resolve(Long id, Long staffId);
}

