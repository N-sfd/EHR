package com.ehr.staffservice.service.patientaccess;

import com.ehr.staffservice.dto.patientaccess.CoverageDto;
import java.util.List;

public interface CoverageService {
    List<CoverageDto> getCoveragesByPatientId(Long patientId);
    CoverageDto getPrimaryCoverage(Long patientId);
    CoverageDto createCoverage(CoverageDto dto);
    CoverageDto updateCoverage(Long id, CoverageDto dto);
}

