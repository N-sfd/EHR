package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class StaffDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY) // Read-only: included in GET, ignored in PUT/POST
    private Long staffId;
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY) // Read-only: auto-generated, not updatable
    private String staffCode;

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String email;
    private Long departmentId;
    private Long jobId;             // designation
    private Long roleId;             // assigned role
    private String employmentType;  // FULL_TIME, PART_TIME, etc.
    private LocalDate joiningDate;
    private String status;          // ACTIVE, INACTIVE
    private String photoUrl;        // Profile image URL
    private Boolean isDoctor;       // true if this staff is a doctor
    private String doctorCode;      // D-001 when isDoctor=true
}
