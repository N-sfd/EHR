package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class MedicationDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long medicationId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Medication name is required")
    private String medicationName;

    private String genericName;
    private String dosage;
    private String dosageUnit;
    private String frequency;
    private String route;
    private BigDecimal quantity;
    private String quantityUnit;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long prescribedByStaffId;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, DISCONTINUED, COMPLETED, ON_HOLD

    private String indication;
    private String instructions;

    @NotNull(message = "Is PRN flag is required")
    private Boolean isPrn = false;

    private String prnIndication;

    @NotNull(message = "Allergies checked flag is required")
    private Boolean allergiesChecked = false;

    private String notes;
}

