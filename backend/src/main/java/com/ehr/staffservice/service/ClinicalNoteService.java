package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ClinicalNoteDto;
import java.util.List;

public interface ClinicalNoteService {
    ClinicalNoteDto create(ClinicalNoteDto dto);
    ClinicalNoteDto update(Long id, ClinicalNoteDto dto);
    ClinicalNoteDto get(Long id);
    void delete(Long id);
    List<ClinicalNoteDto> getByPatientId(Long patientId);
    List<ClinicalNoteDto> getByPatientIdAndNoteType(Long patientId, String noteType);
    List<ClinicalNoteDto> getByStaffId(Long staffId);
    ClinicalNoteDto signNote(Long id);
    ClinicalNoteDto cosignNote(Long id, Long cosignerStaffId);
}

