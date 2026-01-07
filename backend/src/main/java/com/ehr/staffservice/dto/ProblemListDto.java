package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class ProblemListDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Problem name is required")
    private String problemName;

    private String icd10Code;
    private String icd10Description;
    private String snomedCode;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, RESOLVED, INACTIVE, REMOVED

    private LocalDate onsetDate;
    private LocalDate resolvedDate;
    private Long diagnosedByStaffId;
    private Long resolvedByStaffId;
    private String severity; // MILD, MODERATE, SEVERE, CRITICAL
    private Boolean chronic = false;
    private Boolean active = true;
    private String notes;
    private String priority; // HIGH, MEDIUM, LOW
}

