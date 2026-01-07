package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.*;
import java.time.LocalDate;

@Data
public class PatientDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long patientId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String patientCode;

    @NotBlank(message = "First name is required")
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @NotBlank(message = "Gender is required")
    @Size(max = 20, message = "Gender must not exceed 20 characters")
    private String gender;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    @NotBlank(message = "Phone number is required")
    @Size(max = 30, message = "Phone number must not exceed 30 characters")
    private String phoneNumber;

    @Email(message = "Email should be valid")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 50, message = "City must not exceed 50 characters")
    private String city;

    @Size(max = 50, message = "State must not exceed 50 characters")
    private String state;

    @Size(max = 10, message = "Zip code must not exceed 10 characters")
    private String zipCode;

    @Size(max = 50, message = "Country must not exceed 50 characters")
    private String country;

    @Size(max = 100, message = "Emergency contact name must not exceed 100 characters")
    private String emergencyContactName;

    @Size(max = 30, message = "Emergency contact phone must not exceed 30 characters")
    private String emergencyContactPhone;

    @Size(max = 10, message = "Blood group must not exceed 10 characters")
    private String bloodGroup;

    private String allergies;

    private String medicalHistory;

    private String photoUrl;

    @Size(max = 30, message = "Status must not exceed 30 characters")
    private String status; // ACTIVE, INACTIVE, DECEASED

    @Size(max = 100, message = "Insurance provider must not exceed 100 characters")
    private String insuranceProvider;

    @Size(max = 50, message = "Insurance policy number must not exceed 50 characters")
    private String insurancePolicyNumber;

    private Long primaryDoctorId;
}

