package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Data
public class WorkListTaskDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long taskId;

    private Long patientId;

    private Long assignedToStaffId;

    private Long createdByStaffId;

    @NotBlank(message = "Task type is required")
    private String taskType; // PRN, Timed, Routine, Stat

    @NotBlank(message = "Priority is required")
    private String priority; // Stat, High, Routine, Low

    @NotBlank(message = "Task description is required")
    private String taskDescription;

    private LocalDateTime dueDateTime;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime completedAt;

    @NotBlank(message = "Status is required")
    private String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    private String notes;

    private Long departmentId;
}

