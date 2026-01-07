package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RoleDto {

    private Long roleId;

    @NotBlank
    private String name;        // "Admin", "Doctor", "Receptionist"

    private String code;        // "ADMIN", "DOCTOR", "RECEPTIONIST"

    private String description;

    private String roleType;    // "SYSTEM", "CLINICAL", "NON_CLINICAL"

    private Boolean isDefault = false;   // default role for new staff?

    private String status = "ACTIVE";    // ACTIVE / INACTIVE
}

