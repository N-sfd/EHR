package com.ehr.staffservice.dto.admin;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class VisitTypeDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Duration is required")
    @Min(value = 15, message = "Duration must be at least 15 minutes")
    private Integer durationMins;

    private List<Long> allowedDepartmentIds = new ArrayList<>();
    private Boolean allowOverbook = false;
    private List<String> requiredResources = new ArrayList<>();
    private Boolean isActive = true;
}

