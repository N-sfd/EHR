package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateRefillRequestDto {
    @NotNull(message = "Medication ID is required")
    private Long medicationId;
    
    private String notes; // Optional notes for the refill request
}

