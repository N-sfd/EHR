package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
public class CalendarViewDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private String viewType; // WEEK, MONTH, DAY, YEAR
    private List<AppointmentDto> appointments;
    private Map<LocalDate, List<AppointmentDto>> appointmentsByDate;
    private List<TimeSlotDto> availableSlots;
}

