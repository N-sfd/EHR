package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class CarePlanDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long carePlanId;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Problem category is required")
    private String problemCategory;

    @NotBlank(message = "Problem description is required")
    private String problemDescription;

    @NotBlank(message = "Goal description is required")
    private String goalDescription;

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, RESOLVED, ON_HOLD

    private LocalDate startDate;

    private LocalDate targetDate;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDate resolvedDate;

    private Long createdByStaffId;

    private String notes;
}

