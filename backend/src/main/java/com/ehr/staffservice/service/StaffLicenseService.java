package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.StaffLicenseDto;
import java.util.List;
import java.util.UUID;

public interface StaffLicenseService {
    StaffLicenseDto add(StaffLicenseDto dto);
    List<StaffLicenseDto> getByStaff(UUID staffId);
}
