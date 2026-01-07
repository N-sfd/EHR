package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ImagingStudyDto;
import java.util.List;

public interface ImagingStudyService {
    ImagingStudyDto create(ImagingStudyDto dto);
    ImagingStudyDto update(Long id, ImagingStudyDto dto);
    ImagingStudyDto get(Long id);
    ImagingStudyDto getByStudyNumber(String studyNumber);
    void delete(Long id);
    List<ImagingStudyDto> getByPatientId(Long patientId);
    List<ImagingStudyDto> getByPatientIdAndStatus(Long patientId, String status);
    List<ImagingStudyDto> getByStudyType(String studyType);
    List<ImagingStudyDto> getPreliminaryStudies();
    ImagingStudyDto completeStudy(Long id, Long staffId, String findings, String impression);
}

