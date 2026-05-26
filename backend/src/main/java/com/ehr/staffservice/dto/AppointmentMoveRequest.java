package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AppointmentMoveRequest {
    @JsonProperty("startAt")
    private LocalDateTime startAt;
    
    private Long doctorId;
    private Long roomId;
}

