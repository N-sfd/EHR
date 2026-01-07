package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class PatientContactDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Contact type is required")
    private String contactType; // EMERGENCY, GUARDIAN, FAMILY, CAREGIVER, OTHER

    private String firstName;
    private String lastName;
    private String relationship;
    private String homePhone;
    private String mobilePhone;
    private String workPhone;
    private String workExtension;
    private String alternatePhone;
    private String email;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String stateProvince;
    private String postalCode;
    private String country;
    private Boolean isPrimary = false;
    private Boolean isEmergencyContact = false;
    private Boolean canConsent = false;
    private String notes;
}

