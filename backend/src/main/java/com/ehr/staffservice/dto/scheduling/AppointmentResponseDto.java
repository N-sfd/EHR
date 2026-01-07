package com.ehr.staffservice.dto.scheduling;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentResponseDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private Long patientId;
    private String patientName;
    private String patientMrn;

    private Long providerId;
    private String providerName;

    private Long departmentId;
    private String departmentName;

    private Long visitTypeId;
    private String visitTypeName;

    private LocalDateTime startDateTime;
    private Integer durationMins;
    private String status;
    private String reason;
    private String notes;
}

