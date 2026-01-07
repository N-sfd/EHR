package com.ehr.staffservice.service.patientaccess;

import com.ehr.staffservice.dto.patientaccess.PatientDto;
import java.util.List;

public interface PatientService {
    List<PatientDto> searchPatients(String query);
    PatientDto getPatientById(Long id);
    PatientDto getPatientByMrn(String mrn);
    PatientDto createPatient(PatientDto dto);
    PatientDto updatePatient(Long id, PatientDto dto);
}

