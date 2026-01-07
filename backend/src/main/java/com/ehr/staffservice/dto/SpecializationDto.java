package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SpecializationDto {

    private Long specializationId;

    @NotBlank
    private String name;          // "Cardiology", "Pediatrics"

    private String code;          // "CARDIO", "PEDIATRICS"

    private Long departmentId;    // optional link to department

    private String description;

    private String status = "ACTIVE";    // ACTIVE / INACTIVE
}

