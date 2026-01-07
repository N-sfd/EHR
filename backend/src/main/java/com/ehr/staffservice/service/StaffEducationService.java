package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.StaffEducationDto;
import java.util.List;
import java.util.UUID;

public interface StaffEducationService {
    StaffEducationDto add(StaffEducationDto dto);
    List<StaffEducationDto> getByStaff(UUID staffId);
}
