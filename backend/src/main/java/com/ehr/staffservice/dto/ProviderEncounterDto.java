package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ProviderEncounterDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Encounter ID is required")
    private Long encounterId;

    private Long appointmentId;
    private Long patientId;
    private Long providerId;
    private LocalDateTime encounterDateTime;
    
    // Assessment
    private String assessment;
    private String diagnosisCodes; // ICD-10 codes
    private String diagnosisDescriptions;
    private String primaryDiagnosis;
    
    // Plan
    private String plan;
    private String followUpInstructions;
    private Boolean followUpAppointmentNeeded = false;
    private Integer followUpDays;
    
    // SOAP Notes
    private String subjective;
    private String objective;
    private String assessmentSoap;
    private String planSoap;
    
    // Orders Summary
    private Boolean ordersPlaced = false;
    private Integer labOrdersCount = 0;
    private Integer imagingOrdersCount = 0;
    private Integer medicationOrdersCount = 0;
    
    // Status
    private Boolean isSigned = false;
    private LocalDateTime signedDateTime;
    private Long signedByStaffId;
    private Boolean isComplete = false;
    private LocalDateTime completedDateTime;
    private String notes;
}

