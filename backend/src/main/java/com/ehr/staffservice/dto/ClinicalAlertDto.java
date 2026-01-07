package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ClinicalAlertDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private Long patientId; // Nullable for system-wide alerts

    @NotBlank(message = "Alert type is required")
    private String alertType;

    @NotBlank(message = "Alert category is required")
    private String alertCategory; // CRITICAL, WARNING, INFORMATION, REMINDER

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message is required")
    private String message;

    @NotBlank(message = "Priority is required")
    private String priority; // CRITICAL, HIGH, MEDIUM, LOW

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, ACKNOWLEDGED, RESOLVED, EXPIRED, DISMISSED

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime triggeredAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime acknowledgedAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long acknowledgedByStaffId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime resolvedAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long resolvedByStaffId;

    private LocalDateTime expiresAt;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Boolean actionRequired = false;
    private String actionTaken;
    private String notes;
}

