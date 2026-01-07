package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "patient_demographics")
@Data
@EqualsAndHashCode(callSuper = false)
public class PatientDemographics extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false, unique = true)
    private Long patientId;

    // Name Information
    @Column(name = "middle_name", length = 100)
    private String middleName;

    @Column(name = "preferred_name", length = 100)
    private String preferredName;

    @Column(name = "previous_last_name", length = 100)
    private String previousLastName;

    @Column(name = "maiden_name", length = 100)
    private String maidenName;

    @Column(name = "name_prefix", length = 20)
    private String namePrefix; // Mr., Mrs., Dr., etc.

    @Column(name = "name_suffix", length = 20)
    private String nameSuffix; // Jr., Sr., III, etc.

    // Identification
    @Column(name = "medical_record_number", length = 50, unique = true)
    private String medicalRecordNumber;

    @Column(name = "ssn", length = 20)
    private String ssn; // Social Security Number

    @Column(name = "drivers_license_number", length = 50)
    private String driversLicenseNumber;

    @Column(name = "drivers_license_state", length = 50)
    private String driversLicenseState;

    @Column(name = "bc_phn", length = 20)
    private String bcPhn; // British Columbia Personal Health Number

    // Personal Information
    @Column(name = "marital_status", length = 50)
    private String maritalStatus;

    @Column(name = "religion", length = 100)
    private String religion;

    @Column(name = "language", length = 100)
    private String language;

    @Column(name = "interpreter_required")
    private Boolean interpreterRequired = false;

    @Column(name = "ethnicity", length = 100)
    private String ethnicity;

    @Column(name = "race", length = 100)
    private String race;

    @Column(name = "gender_identity", length = 50)
    private String genderIdentity;

    @Column(name = "sexual_orientation", length = 50)
    private String sexualOrientation;

    @Column(name = "pronoun", length = 20)
    private String pronoun;

    // Contact Preferences
    @Column(name = "preferred_phone_type", length = 50)
    private String preferredPhoneType; // Home, Mobile, Work

    @Column(name = "preferred_communication", length = 50)
    private String preferredCommunication; // Phone, Email, Text, Mail

    @Column(name = "email_reminders")
    private Boolean emailReminders = false;

    @Column(name = "phone_reminders")
    private Boolean phoneReminders = false;

    @Column(name = "text_reminders")
    private Boolean textReminders = false;

    // VIP and Special Flags
    @Column(name = "vip_person_level", length = 50)
    private String vipPersonLevel;

    @Column(name = "promis")
    private Boolean promis = false; // Patient Reported Outcome Measurement Information System

    @Column(name = "csbc")
    private Boolean csbc = false; // Cancer Screening BC

    @Column(name = "clinic_flag", length = 200)
    private String clinicFlag; // e.g., "VPP Breast Cancer Screening"

    // Pre-registration
    @Column(name = "pre_reg_complete_date")
    private LocalDate preRegCompleteDate;

    // Additional Notes
    @Column(name = "disclosure_notes", columnDefinition = "TEXT")
    private String disclosureNotes;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;
}

