package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class AllergyDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long allergyId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Allergen is required")
    private String allergen;

    private String allergyType; // Drug, Food, Environmental

    private String severity; // Mild, Moderate, Severe, Life-threatening

    private String reaction;

    private LocalDate onsetDate;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, INACTIVE, RESOLVED

    private Long verifiedByStaffId;

    private LocalDate verifiedDate;

    private String notes;
}

