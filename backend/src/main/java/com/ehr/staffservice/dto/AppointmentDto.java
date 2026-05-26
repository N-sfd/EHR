package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Unified Appointment DTO
 * Used for:
 * - ScheduleGrid (lightweight blocks)
 * - Scheduler (form create/update)
 * - API responses (full details)
 */
@Data
public class AppointmentDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String patientName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String patientAvatarUrl;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String doctorName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String doctorAvatarUrl;

    private Long departmentId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String departmentName;

    @NotNull(message = "Start datetime is required")
    private LocalDateTime startDateTime;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime endDateTime;

    @NotNull(message = "Duration is required")
    @Positive(message = "Duration must be positive")
    private Integer durationMinutes;

    private Long visitTypeId;
    private String visitType;
    private String status = "SCHEDULED";
    private String priority = "NORMAL";

    // Optional fields for full details
    private String reason;
    private String notes;
    private Long locationId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime updatedAt;

    // Computed endDateTime (if not provided)
    public LocalDateTime getEndDateTime() {
        if (endDateTime != null) {
            return endDateTime;
        }
        if (startDateTime != null && durationMinutes != null) {
            return startDateTime.plusMinutes(durationMinutes);
        }
        return null;
    }
}
