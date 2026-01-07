package com.ehr.staffservice.dto.patientaccess;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CoverageDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Payer is required")
    private String payer;

    @NotBlank(message = "Member ID is required")
    private String memberId;

    private String groupNumber;
    private LocalDate startDate;
    private LocalDate endDate;

    @NotNull(message = "Eligibility status is required")
    private String eligibilityStatus; // ACTIVE, NOT_VERIFIED, EXPIRED, INACTIVE

    private BigDecimal copay;
    private BigDecimal deductible;
    private Boolean isPrimary = true;
}

