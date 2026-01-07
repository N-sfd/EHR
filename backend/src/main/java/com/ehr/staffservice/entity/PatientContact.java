package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "patient_contacts")
@Data
@EqualsAndHashCode(callSuper = false)
public class PatientContact extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "contact_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ContactType contactType;

    @Column(name = "first_name", length = 100)
    private String firstName;

    @Column(name = "last_name", length = 100)
    private String lastName;

    @Column(name = "relationship", length = 100)
    private String relationship; // Spouse, Parent, Guardian, etc.

    @Column(name = "home_phone", length = 30)
    private String homePhone;

    @Column(name = "mobile_phone", length = 30)
    private String mobilePhone;

    @Column(name = "work_phone", length = 30)
    private String workPhone;

    @Column(name = "work_extension", length = 20)
    private String workExtension;

    @Column(name = "alternate_phone", length = 30)
    private String alternatePhone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state_province", length = 100)
    private String stateProvince;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "is_emergency_contact")
    private Boolean isEmergencyContact = false;

    @Column(name = "can_consent")
    private Boolean canConsent = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum ContactType {
        EMERGENCY,
        GUARDIAN,
        FAMILY,
        CAREGIVER,
        OTHER
    }
}

