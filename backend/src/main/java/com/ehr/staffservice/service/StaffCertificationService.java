package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.StaffCertificationDto;
import java.util.List;
import java.util.UUID;

public interface StaffCertificationService {
    StaffCertificationDto add(StaffCertificationDto dto);
    List<StaffCertificationDto> getByStaff(UUID staffId);
}
