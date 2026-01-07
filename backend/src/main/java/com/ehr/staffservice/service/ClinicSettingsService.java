package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ClinicSettingsDto;

public interface ClinicSettingsService {
    ClinicSettingsDto get();
    ClinicSettingsDto create(ClinicSettingsDto dto);
    ClinicSettingsDto update(Long id, ClinicSettingsDto dto);
}

