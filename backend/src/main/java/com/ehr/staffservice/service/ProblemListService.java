package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ProblemListDto;
import java.util.List;

public interface ProblemListService {
    ProblemListDto create(ProblemListDto dto);
    ProblemListDto update(Long id, ProblemListDto dto);
    ProblemListDto get(Long id);
    void delete(Long id);
    List<ProblemListDto> getByPatientId(Long patientId);
    List<ProblemListDto> getActiveProblemsByPatientId(Long patientId);
    List<ProblemListDto> getByPatientIdAndStatus(Long patientId, String status);
    ProblemListDto resolve(Long id, Long resolvedByStaffId);
}

