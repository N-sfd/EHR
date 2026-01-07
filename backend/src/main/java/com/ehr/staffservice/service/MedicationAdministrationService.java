package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.MedicationAdministrationDto;
import java.util.List;

public interface MedicationAdministrationService {
    MedicationAdministrationDto create(MedicationAdministrationDto dto);
    MedicationAdministrationDto update(Long id, MedicationAdministrationDto dto);
    MedicationAdministrationDto get(Long id);
    void delete(Long id);
    List<MedicationAdministrationDto> getByPatientId(Long patientId);
    List<MedicationAdministrationDto> getByMedicationId(Long medicationId);
    List<MedicationAdministrationDto> getByPatientIdAndStatus(Long patientId, String status);
    MedicationAdministrationDto administerMedication(Long id, Long staffId);
    MedicationAdministrationDto holdMedication(Long id, String reason);
    MedicationAdministrationDto refuseMedication(Long id, String reason);
}

