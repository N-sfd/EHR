package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "insurances")
@Data
@EqualsAndHashCode(callSuper = false)
public class Insurance extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "insurance_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private InsuranceType insuranceType;

    @Column(name = "insurance_name", nullable = false, length = 200)
    private String insuranceName;

    @Column(name = "policy_number", length = 100)
    private String policyNumber;

    @Column(name = "group_number", length = 100)
    private String groupNumber;

    @Column(name = "subscriber_id", length = 100)
    private String subscriberId;

    @Column(name = "subscriber_name", length = 200)
    private String subscriberName;

    @Column(name = "subscriber_relationship", length = 50)
    private String subscriberRelationship; // Self, Spouse, Child, Other

    @Column(name = "subscriber_date_of_birth")
    private LocalDate subscriberDateOfBirth;

    @Column(name = "subscriber_ssn", length = 20)
    private String subscriberSsn;

    @Column(name = "effective_date")
    private LocalDate effectiveDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "copay_amount")
    private Double copayAmount;

    @Column(name = "deductible_amount")
    private Double deductibleAmount;

    @Column(name = "coverage_percentage")
    private Double coveragePercentage;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "insurance_phone", length = 30)
    private String insurancePhone;

    @Column(name = "insurance_address_line1", length = 200)
    private String insuranceAddressLine1;

    @Column(name = "insurance_address_line2", length = 200)
    private String insuranceAddressLine2;

    @Column(name = "insurance_city", length = 100)
    private String insuranceCity;

    @Column(name = "insurance_state", length = 100)
    private String insuranceState;

    @Column(name = "insurance_postal_code", length = 20)
    private String insurancePostalCode;

    @Column(name = "insurance_country", length = 100)
    private String insuranceCountry;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum InsuranceType {
        PRIMARY,
        SECONDARY,
        TERTIARY,
        WORKERS_COMP,
        AUTO,
        LIABILITY,
        MEDICARE,
        MEDICAID,
        TRICARE,
        OTHER
    }
}

