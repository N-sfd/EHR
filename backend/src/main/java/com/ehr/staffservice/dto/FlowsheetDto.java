package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class FlowsheetDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Flowsheet name is required")
    private String flowsheetName;

    @NotBlank(message = "Flowsheet type is required")
    private String flowsheetType; // Custom, Standard, Template

    @NotNull(message = "Recorded at is required")
    private LocalDateTime recordedAt;

    @NotNull(message = "Recorded by staff ID is required")
    private Long recordedByStaffId;

    private String data; // JSON string for flexible data storage
    private Long templateId;
    private String status; // DRAFT, FINAL, AMENDED, DELETED
    private String notes;
    private String location;
}

