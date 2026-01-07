package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DepartmentDto {

    private Long departmentId;

    @NotBlank
    private String name;           // "Cardiology", "OPD", "Billing"

    private String code;           // "DEPT_CARDIO", "DEPT_OPD"

    private String type;           // "CLINICAL", "SUPPORT", "ADMIN"

    private String description;

    private String phoneNumber;

    private String email;

    private String status;        // ACTIVE / INACTIVE
    
    private java.sql.Timestamp createdAt;  // For display purposes
}

