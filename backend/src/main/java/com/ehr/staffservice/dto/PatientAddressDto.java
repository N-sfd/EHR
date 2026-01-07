package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class PatientAddressDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Address type is required")
    private String addressType; // PERMANENT, PREVIOUS, MAILING, TEMPORARY, SECONDARY

    @NotBlank(message = "Address line 1 is required")
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private Boolean isPrimary = false;
    private Boolean isActive = true;
    private LocalDate startDate;
    private LocalDate endDate;
    private String notes;
}

