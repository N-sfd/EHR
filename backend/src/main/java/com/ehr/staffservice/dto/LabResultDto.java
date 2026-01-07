package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class LabResultDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long labResultId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long orderId;

    @NotBlank(message = "Test name is required")
    private String testName;

    private String testCode;
    private String testCategory; // Hematology, Chemistry, Microbiology

    private String resultValue;
    private BigDecimal numericValue;
    private String unit;
    private String referenceRange;
    private String flag; // NORMAL, HIGH, LOW, CRITICAL

    private LocalDateTime collectedDateTime;
    private LocalDateTime resultedDateTime;
    private Long collectedByStaffId;
    private Long resultedByStaffId;

    @NotBlank(message = "Status is required")
    private String status; // PENDING, COMPLETED, CANCELLED, CORRECTED

    @NotNull(message = "Is critical flag is required")
    private Boolean isCritical = false;

    @NotNull(message = "Critical value notified flag is required")
    private Boolean criticalValueNotified = false;

    private Long notifiedToStaffId;
    private String notes;
}

