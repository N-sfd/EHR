package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class ImagingStudyDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long imagingStudyId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String studyNumber;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long orderId;

    @NotBlank(message = "Study type is required")
    private String studyType; // X-Ray, CT, MRI, Ultrasound

    private String bodyPart; // Chest, Abdomen, Head
    private String studyDescription;
    private String modality; // XR, CT, MR, US

    private LocalDateTime scheduledDateTime;
    private LocalDateTime performedDateTime;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime completedDateTime;

    private Long orderedByStaffId;
    private Long performedByStaffId;
    private Long interpretedByStaffId;

    @NotBlank(message = "Status is required")
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, PRELIMINARY, FINAL

    private String priority; // Routine, Stat, Urgent

    @NotNull(message = "Contrast used flag is required")
    private Boolean contrastUsed = false;

    private String contrastType;
    private String findings; // Radiologist findings
    private String impression; // Radiologist impression
    private String recommendations;
    private String imageUrls; // Comma-separated or JSON
    private String reportUrl;

    @NotNull(message = "Is preliminary flag is required")
    private Boolean isPreliminary = false;

    private String notes;
}

