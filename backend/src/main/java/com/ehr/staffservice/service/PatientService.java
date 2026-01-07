package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.PatientDto;
import java.util.List;

public interface PatientService {
    PatientDto create(PatientDto dto);
    PatientDto update(Long id, PatientDto dto);
    PatientDto get(Long id);
    PatientDto getByPatientCode(String patientCode);
    List<PatientDto> getAll();
    void delete(Long id);
}

