package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.PatientDemographicsDto;
import java.util.Optional;

public interface PatientDemographicsService {
    PatientDemographicsDto createOrUpdate(PatientDemographicsDto dto);
    Optional<PatientDemographicsDto> getByPatientId(Long patientId);
    PatientDemographicsDto update(Long id, PatientDemographicsDto dto);
    void delete(Long id);
}

