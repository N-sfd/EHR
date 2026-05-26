package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateThreadRequest {
    @NotBlank(message = "Subject is required")
    private String subject;

    @NotBlank(message = "Message body is required")
    private String body;

    @NotNull(message = "Provider ID is required")
    private Long providerId; // doctorId/staffId to send message to
}

