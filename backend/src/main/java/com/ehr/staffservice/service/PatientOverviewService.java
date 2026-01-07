package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.PatientOverviewDto;

public interface PatientOverviewService {
    PatientOverviewDto getPatientOverview(Long patientId);
    PatientOverviewDto getPatientOverviewWithDateRange(Long patientId, String startDate, String endDate);
}

