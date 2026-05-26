package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RefillRequestDto {
    private Long requestId;
    private Long medicationId;
    private String medicationName;
    private Long patientId;
    private String notes;
    private String status; // PENDING, APPROVED, DENIED, FILLED
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
}

