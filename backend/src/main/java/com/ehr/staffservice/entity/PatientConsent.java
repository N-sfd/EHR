package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * Patient Consent entity for tracking signed consents.
 * Maps to patient_consents table.
 */
@Entity
@Table(name = "patient_consents")
@Data
@EqualsAndHashCode(callSuper = false)
public class PatientConsent extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "consent_id")
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "consent_type", nullable = false, length = 100)
    private String consentType = "General Consent";

    @Column(name = "status", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private ConsentStatus status = ConsentStatus.REVOKED;

    @Column(name = "accepted_at")
    private LocalDateTime acceptedAt;

    @Column(name = "version", length = 50)
    private String version;

    @Column(name = "accepted_by", length = 50)
    @Enumerated(EnumType.STRING)
    private AcceptedBy acceptedBy;

    @Column(name = "document_url", length = 500)
    private String documentUrl;

    @Column(name = "signature_id", length = 100)
    private String signatureId;

    // Legacy fields for backward compatibility
    @Column(name = "consent_signed", nullable = false)
    private Boolean consentSigned = false;

    @Column(name = "signed_by", length = 200)
    private String signedBy;

    // Common consent types
    public static final String TYPE_GENERAL = "General Consent";
    public static final String TYPE_HIPAA = "HIPAA";
    public static final String TYPE_TREATMENT = "TREATMENT";
    public static final String TYPE_FINANCIAL = "FINANCIAL";
    public static final String TYPE_SMS = "SMS";
    public static final String TYPE_EMAIL = "EMAIL";

    public enum ConsentStatus {
        ACTIVE,
        REVOKED
    }

    public enum AcceptedBy {
        PATIENT,
        GUARDIAN
    }
}

