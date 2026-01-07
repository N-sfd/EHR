package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.MedicationDto;
import java.util.List;

public interface MedicationService {
    MedicationDto create(MedicationDto dto);
    MedicationDto update(Long id, MedicationDto dto);
    MedicationDto get(Long id);
    void delete(Long id);
    List<MedicationDto> getByPatientId(Long patientId);
    List<MedicationDto> getByPatientIdAndStatus(Long patientId, String status);
    List<MedicationDto> getActiveMedications(Long patientId);
}

