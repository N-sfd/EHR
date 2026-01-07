package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.StaffAwardDto;
import java.util.List;
import java.util.UUID;

public interface StaffAwardService {
    StaffAwardDto add(StaffAwardDto dto);
    List<StaffAwardDto> getByStaff(UUID staffId);
}
