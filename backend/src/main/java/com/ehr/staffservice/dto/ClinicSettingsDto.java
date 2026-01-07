package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ClinicSettingsDto {

    private Long id;

    @NotBlank(message = "Clinic name is required")
    private String clinicName;

    private String legalName;
    private String logoUrl;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private String phoneNumber;
    private String alternatePhoneNumber;
    private String email;
    private String website;
    private String timeZone; // e.g. "America/New_York"
    private String defaultWorkingHours; // JSON string or simple string
}

