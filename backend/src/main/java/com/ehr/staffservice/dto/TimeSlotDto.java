package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class TimeSlotDto {
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean available;
    private String reason; // If not available, why
}

