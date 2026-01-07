package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "eligibility_verifications")
@Data
@EqualsAndHashCode(callSuper = false)
public class EligibilityVerification extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "insurance_id", nullable = false)
    private Long insuranceId;

    @Column(name = "verification_date", nullable = false)
    private LocalDateTime verificationDate;

    @Column(name = "verified_by_staff_id")
    private Long verifiedByStaffId;

    @Column(name = "verification_method", length = 50)
    @Enumerated(EnumType.STRING)
    private VerificationMethod verificationMethod;

    @Column(name = "eligibility_status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EligibilityStatus eligibilityStatus;

    @Column(name = "effective_date")
    private LocalDateTime effectiveDate;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate;

    @Column(name = "benefit_plan_name", length = 200)
    private String benefitPlanName;

    @Column(name = "coverage_type", length = 100)
    private String coverageType;

    @Column(name = "copay_amount")
    private Double copayAmount;

    @Column(name = "deductible_amount")
    private Double deductibleAmount;

    @Column(name = "out_of_pocket_max")
    private Double outOfPocketMax;

    @Column(name = "remaining_deductible")
    private Double remainingDeductible;

    @Column(name = "remaining_out_of_pocket")
    private Double remainingOutOfPocket;

    @Column(name = "response_code", length = 50)
    private String responseCode;

    @Column(name = "response_message", columnDefinition = "TEXT")
    private String responseMessage;

    @Column(name = "raw_response", columnDefinition = "TEXT")
    private String rawResponse; // Store full API response

    @Column(name = "next_verification_due")
    private LocalDateTime nextVerificationDue;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum VerificationMethod {
        ELECTRONIC,
        PHONE,
        PORTAL,
        MANUAL,
        AUTOMATED
    }

    public enum EligibilityStatus {
        ELIGIBLE,
        INELIGIBLE,
        PENDING,
        EXPIRED,
        TERMINATED,
        UNKNOWN
    }
}

