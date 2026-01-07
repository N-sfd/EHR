package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ClinicalNoteDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long noteId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Author staff ID is required")
    private Long authorStaffId;

    @NotBlank(message = "Note type is required")
    private String noteType; // Progress Note, Admission Note, Discharge Note, etc.

    private String noteTitle;

    @NotBlank(message = "Note content is required")
    private String noteContent;

    @NotNull(message = "Note date/time is required")
    private LocalDateTime noteDateTime;

    private Long encounterId;

    @NotBlank(message = "Status is required")
    private String status; // DRAFT, FINAL, AMENDED

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Boolean isSigned = false;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime signedDateTime;

    private Boolean requiresCosign = false;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long cosignedByStaffId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime cosignedDateTime;
}

