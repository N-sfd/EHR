package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProcedureDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Procedure name is required")
    private String procedureName;

    private String cptCode;
    private String icd10PcsCode;
    private String procedureDescription;

    @NotNull(message = "Procedure date is required")
    private LocalDate procedureDate;

    private LocalDateTime procedureTime;
    private Long performedByStaffId;
    private String assistedByStaffIds;
    private String location;

    @NotBlank(message = "Status is required")
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, POSTPONED

    private String anesthesiaType;
    private Integer durationMinutes;
    private String indication;
    private String findings;
    private String complications;
    private String postProcedureInstructions;
    private Boolean followUpRequired = false;
    private LocalDate followUpDate;
    private String notes;
}

