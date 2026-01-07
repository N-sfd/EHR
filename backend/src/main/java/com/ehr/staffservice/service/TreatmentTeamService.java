package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.TreatmentTeamDto;
import java.util.List;

public interface TreatmentTeamService {
    TreatmentTeamDto create(TreatmentTeamDto dto);
    TreatmentTeamDto update(Long id, TreatmentTeamDto dto);
    TreatmentTeamDto get(Long id);
    void delete(Long id);
    List<TreatmentTeamDto> getByPatientIdAndStatus(Long patientId, String status);
    List<TreatmentTeamDto> getByStaffIdAndStatus(Long staffId, String status);
}

