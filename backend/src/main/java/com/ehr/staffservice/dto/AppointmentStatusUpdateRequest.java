package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request DTO for updating appointment status
 * Used by Epic-style scheduler for quick status changes (cancel, no-show, check-in)
 */
@Data
public class AppointmentStatusUpdateRequest {
    @NotBlank(message = "Status is required")
    private String status;   // e.g. SCHEDULED, CHECKED_IN, CANCELLED, NO_SHOW, CHECKED_OUT
    
    private String reason;   // required for CANCELLED/NO_SHOW (enforced in service layer)
}

