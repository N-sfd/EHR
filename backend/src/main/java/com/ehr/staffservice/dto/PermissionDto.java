package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class PermissionDto {

    private Long permissionId;

    @NotBlank(message = "Permission name is required")
    private String name;

    @NotBlank(message = "Module is required")
    private String module;

    @NotBlank(message = "Action is required")
    private String action;
}

