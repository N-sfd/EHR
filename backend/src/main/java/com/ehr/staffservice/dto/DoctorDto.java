package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class DoctorDto {

    // Staff fields (shared) - these map from Staff entity
    private Long staffId;
    private String staffCode;  // From Staff.staffCode

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    private String gender;
    private LocalDate dateOfBirth;
    private String phoneNumber;
    private String email;
    private Long departmentId;
    private Long jobId;
    private String employmentType;
    private LocalDate joiningDate;
    private String status;
    private String photoUrl;        // Profile image URL (from Staff)

    // Doctor-specific fields
    private String doctorCode;
    private String specialization;
    private Integer yearsOfExperience;
    private BigDecimal consultationFee;
    private String consultationType; // IN_PERSON/ONLINE/BOTH
    private String about;

    // Doctor child entities
    private List<DoctorEducationDto> educations;
    private List<DoctorCertificationDto> certifications;
    private List<DoctorAvailabilityDto> availabilities;
    private List<DoctorLicenseDto> licenses;
}

