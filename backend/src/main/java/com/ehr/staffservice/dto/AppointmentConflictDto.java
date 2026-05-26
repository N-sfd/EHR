package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Conflict information when appointment overlaps
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentConflictDto {
    @JsonProperty("appointmentId")
    private Long appointmentId;
    
    @JsonProperty("patientName")
    private String patientName;
    
    @JsonProperty("startAt")
    private LocalDateTime startAt;
    
    @JsonProperty("endAt")
    private LocalDateTime endAt;
    
    @JsonProperty("reason")
    private String reason; // e.g., "Provider already has appointment at this time"
}

