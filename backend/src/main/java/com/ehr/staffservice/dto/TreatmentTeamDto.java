package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
public class TreatmentTeamDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long treatmentTeamId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @NotBlank(message = "Relationship is required")
    private String relationship; // Attending, Resident, Registered Nurse, etc.

    private String specialty;

    private String contactPhone;

    private String contactEmail;

    @NotNull(message = "Is primary flag is required")
    private Boolean isPrimary = false;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, INACTIVE
}

