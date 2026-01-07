package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DesignationDto {

    private Long designationId;

    @NotBlank
    private String title;          // "Staff Nurse", "Consultant", "Receptionist"

    private String code;           // "STAFF_NURSE", "CONSULTANT", "RECEPTIONIST"

    private String category;       // "CLINICAL", "NON_CLINICAL", "ADMIN"

    private Long departmentId;    // optional link to department

    private Boolean managerial = false;  // is it a supervisor/manager role?

    private String description;

    private String status = "ACTIVE";    // ACTIVE / INACTIVE
}

