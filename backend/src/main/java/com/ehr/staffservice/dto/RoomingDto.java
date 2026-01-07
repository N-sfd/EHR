package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class RoomingDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Encounter ID is required")
    private Long encounterId;

    private Long appointmentId;
    private Long patientId;
    private Long roomedByStaffId;
    private LocalDateTime roomedDateTime;
    private String roomNumber;
    
    // Vitals
    private Integer bloodPressureSystolic;
    private Integer bloodPressureDiastolic;
    private BigDecimal temperatureF;
    private BigDecimal temperatureC;
    private Integer pulse;
    private Integer respiratoryRate;
    private BigDecimal oxygenSaturation;
    private BigDecimal heightInches;
    private BigDecimal heightCm;
    private BigDecimal weightLbs;
    private BigDecimal weightKg;
    private BigDecimal bmi;
    private Integer painScore;
    
    // History
    private String chiefComplaint;
    private String historyOfPresentIllness;
    private Boolean medicationsReviewed = false;
    private Boolean allergiesReviewed = false;
    
    // Screening
    private String smokingStatus;
    private Boolean fallRiskAssessment = false;
    private Integer fallRiskScore;
    private Boolean depressionScreening = false;
    private Integer depressionScreeningScore;
    private Boolean alcoholScreening = false;
    
    // Additional
    private String patientConcerns;
    private String nursingNotes;
    private Boolean isComplete = false;
    private LocalDateTime completedDateTime;
}

