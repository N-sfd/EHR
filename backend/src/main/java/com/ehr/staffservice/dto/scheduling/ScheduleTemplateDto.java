package com.ehr.staffservice.dto.scheduling;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class ScheduleTemplateDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    @NotNull(message = "Day of week is required")
    private String dayOfWeek; // MONDAY, TUESDAY, etc.

    @NotNull(message = "Start time is required")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    private LocalTime endTime;

    @NotNull(message = "Slot duration is required")
    private Integer slotDuration; // in minutes

    private List<TimeRangeDto> blockedRanges = new ArrayList<>();
    private Boolean overbookAllowed = false;
    private Boolean isActive = true;

    @Data
    public static class TimeRangeDto {
        private LocalTime startTime;
        private LocalTime endTime;
    }
}

