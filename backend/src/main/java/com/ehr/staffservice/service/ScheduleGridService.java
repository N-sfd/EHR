package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ScheduleGridDto;
import java.time.LocalDate;
import java.util.List;

public interface ScheduleGridService {
    ScheduleGridDto getProviderScheduleGrid(Long providerId, LocalDate date);
    List<ScheduleGridDto> getProviderScheduleGridRange(Long providerId, LocalDate startDate, LocalDate endDate);
    List<ScheduleGridDto> getMultiProviderScheduleGrid(List<Long> providerIds, LocalDate date);
}

