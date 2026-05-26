package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ScheduleGridDto;
import java.time.LocalDate;
import java.util.List;

public interface ScheduleGridService {
    ScheduleGridDto getDoctorScheduleGrid(Long doctorId, LocalDate date);
    List<ScheduleGridDto> getDoctorScheduleGridRange(Long doctorId, LocalDate startDate, LocalDate endDate);
    List<ScheduleGridDto> getMultiDoctorScheduleGrid(List<Long> doctorIds, LocalDate date);
}

