package com.ehr.staffservice.dto.ambulatory;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class EncounterDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    private Long appointmentId;
    
    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String status; // ROOMING, PROVIDER_ENCOUNTER, CHECKOUT, COMPLETED
    private String roomingVitals; // JSON string
    private String medReconciliation; // JSON string
    private List<String> diagnoses = new ArrayList<>();
    private List<String> orders = new ArrayList<>();
    private String soapNote;
    
    // Audit fields
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime createdAt;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime updatedAt;
}

