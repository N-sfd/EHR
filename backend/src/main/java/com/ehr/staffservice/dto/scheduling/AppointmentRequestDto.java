package com.ehr.staffservice.dto.scheduling;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentRequestDto {
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Provider ID is required")
    private Long providerId;

    private Long departmentId;
    private Long visitTypeId;

    @NotNull(message = "Start date time is required")
    private LocalDateTime startDateTime;

    @NotNull(message = "Duration is required")
    private Integer durationMins;

    private String reason;
    private String notes;
}

