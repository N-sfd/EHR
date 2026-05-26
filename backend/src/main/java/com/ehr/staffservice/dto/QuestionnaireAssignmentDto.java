package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class QuestionnaireAssignmentDto {
    private Long assignmentId;
    private Long questionnaireId;
    private String questionnaireTitle;
    private String questionnaireDescription;
    private Long patientId;
    private LocalDate assignedDate;
    private LocalDate dueDate;
    private String status; // ASSIGNED, IN_PROGRESS, COMPLETED, EXPIRED
    private Boolean isOverdue;
}

