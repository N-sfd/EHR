package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ProcedureDto;
import java.time.LocalDate;
import java.util.List;

public interface ProcedureService {
    ProcedureDto create(ProcedureDto dto);
    ProcedureDto update(Long id, ProcedureDto dto);
    ProcedureDto get(Long id);
    void delete(Long id);
    List<ProcedureDto> getByPatientId(Long patientId);
    List<ProcedureDto> getByPatientIdAndStatus(Long patientId, String status);
    List<ProcedureDto> getByPatientIdAndDateRange(Long patientId, LocalDate startDate, LocalDate endDate);
    List<ProcedureDto> getByPerformedByStaffIdAndDateRange(Long staffId, LocalDate startDate);
}

