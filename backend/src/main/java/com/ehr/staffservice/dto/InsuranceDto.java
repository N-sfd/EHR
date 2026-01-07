package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class InsuranceDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Insurance type is required")
    private String insuranceType; // PRIMARY, SECONDARY, TERTIARY, etc.

    @NotBlank(message = "Insurance name is required")
    private String insuranceName;

    private String policyNumber;
    private String groupNumber;
    private String subscriberId;
    private String subscriberName;
    private String subscriberRelationship;
    private LocalDate subscriberDateOfBirth;
    private String subscriberSsn;
    private LocalDate effectiveDate;
    private LocalDate expirationDate;
    private Double copayAmount;
    private Double deductibleAmount;
    private Double coveragePercentage;
    private Boolean isPrimary = false;
    private Boolean isActive = true;
    private String insurancePhone;
    private String insuranceAddressLine1;
    private String insuranceAddressLine2;
    private String insuranceCity;
    private String insuranceState;
    private String insurancePostalCode;
    private String insuranceCountry;
    private String notes;
}

