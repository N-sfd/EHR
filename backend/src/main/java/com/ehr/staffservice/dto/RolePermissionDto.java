package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class RolePermissionDto {

    @NotNull(message = "Permission ID is required")
    private Long permissionId;

    @NotNull(message = "Enabled status is required")
    private Boolean enabled;
}

