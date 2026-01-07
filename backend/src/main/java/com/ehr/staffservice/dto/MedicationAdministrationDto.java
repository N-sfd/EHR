package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class MedicationAdministrationDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long administrationId;

    @NotNull(message = "Medication ID is required")
    private Long medicationId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Scheduled time is required")
    private LocalDateTime scheduledTime;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime administeredTime;

    private Long administeredByStaffId;

    @NotBlank(message = "Status is required")
    private String status; // SCHEDULED, GIVEN, REFUSED, HELD, MISSED, NOT_DUE

    private String doseGiven;
    private String routeUsed;
    private String site;
    private String reasonHeld;
    private String reasonRefused;
    private Long witnessStaffId;
    private Long wasteWitnessStaffId;
    private String notes;
}

