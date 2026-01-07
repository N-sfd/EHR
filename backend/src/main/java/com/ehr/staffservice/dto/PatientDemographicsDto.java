package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class PatientDemographicsDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private String middleName;
    private String preferredName;
    private String previousLastName;
    private String maidenName;
    private String namePrefix;
    private String nameSuffix;
    private String medicalRecordNumber;
    private String ssn;
    private String driversLicenseNumber;
    private String driversLicenseState;
    private String bcPhn;
    private String maritalStatus;
    private String religion;
    private String language;
    private Boolean interpreterRequired = false;
    private String ethnicity;
    private String race;
    private String genderIdentity;
    private String sexualOrientation;
    private String pronoun;
    private String preferredPhoneType;
    private String preferredCommunication;
    private Boolean emailReminders = false;
    private Boolean phoneReminders = false;
    private Boolean textReminders = false;
    private String vipPersonLevel;
    private Boolean promis = false;
    private Boolean csbc = false;
    private String clinicFlag;
    private LocalDate preRegCompleteDate;
    private String disclosureNotes;
    private String additionalNotes;
}

