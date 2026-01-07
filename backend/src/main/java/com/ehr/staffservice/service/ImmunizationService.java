package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ImmunizationDto;
import java.time.LocalDate;
import java.util.List;

public interface ImmunizationService {
    ImmunizationDto create(ImmunizationDto dto);
    ImmunizationDto update(Long id, ImmunizationDto dto);
    ImmunizationDto get(Long id);
    void delete(Long id);
    List<ImmunizationDto> getByPatientId(Long patientId);
    List<ImmunizationDto> getByPatientIdAndStatus(Long patientId, String status);
    List<ImmunizationDto> getByPatientIdAndDateRange(Long patientId, LocalDate startDate, LocalDate endDate);
    List<ImmunizationDto> getByPatientIdAndVaccineName(Long patientId, String vaccineName);
}

