package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class EligibilityVerificationDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Insurance ID is required")
    private Long insuranceId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime verificationDate;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long verifiedByStaffId;

    private String verificationMethod; // ELECTRONIC, PHONE, PORTAL, MANUAL, AUTOMATED
    private String eligibilityStatus; // ELIGIBLE, INELIGIBLE, PENDING, EXPIRED, TERMINATED, UNKNOWN
    private LocalDateTime effectiveDate;
    private LocalDateTime expirationDate;
    private String benefitPlanName;
    private String coverageType;
    private Double copayAmount;
    private Double deductibleAmount;
    private Double outOfPocketMax;
    private Double remainingDeductible;
    private Double remainingOutOfPocket;
    private String responseCode;
    private String responseMessage;
    private String rawResponse;
    private LocalDateTime nextVerificationDue;
    private String notes;
}

