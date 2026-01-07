package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VitalSignDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long vitalSignId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long recordedByStaffId;

    @NotNull(message = "Recorded date/time is required")
    private LocalDateTime recordedAt;

    private BigDecimal temperatureF;
    private BigDecimal temperatureC;
    private Integer heartRate;
    private Integer systolicBp;
    private Integer diastolicBp;
    private Integer respiratoryRate;
    private BigDecimal spo2;
    private Integer painScore;
    private BigDecimal weightKg;
    private BigDecimal weightLbs;
    private BigDecimal heightCm;
    private BigDecimal heightInches;
    private BigDecimal bmi;
    private String notes;
}

