package com.ehr.staffservice.dto.scheduling;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotBlank(message = "Name is required")
    private String name;

    private String location;
    private Boolean isActive = true;
}

