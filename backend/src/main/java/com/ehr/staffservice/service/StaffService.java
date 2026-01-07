package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.StaffDto;
import java.util.List;
import com.ehr.staffservice.dto.StaffWithAppointmentsDto;

public interface StaffService {
    StaffDto create(StaffDto dto);
    StaffDto update(Long id, StaffDto dto);
    StaffDto get(Long id);
    List<StaffDto> getAll();
    void delete(Long id);

    // ✅ NEW method
    StaffWithAppointmentsDto getStaffWithAppointments(Long id);
}