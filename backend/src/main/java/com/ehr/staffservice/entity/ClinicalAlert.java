package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "clinical_alerts")
@Data
@EqualsAndHashCode(callSuper = false)
public class ClinicalAlert extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id")
    private Long patientId; // Nullable for system-wide alerts

    @Column(name = "alert_type", nullable = false, length = 100)
    @Enumerated(EnumType.STRING)
    private AlertType alertType;

    @Column(name = "alert_category", nullable = false, length = 100)
    @Enumerated(EnumType.STRING)
    private AlertCategory alertCategory;

    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "priority", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AlertPriority priority;

    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AlertStatus status;

    @Column(name = "triggered_at", nullable = false)
    private LocalDateTime triggeredAt;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "acknowledged_by_staff_id")
    private Long acknowledgedByStaffId;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolved_by_staff_id")
    private Long resolvedByStaffId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "related_entity_type", length = 100)
    private String relatedEntityType; // VITAL_SIGN, LAB_RESULT, MEDICATION, etc.

    @Column(name = "related_entity_id")
    private Long relatedEntityId;

    @Column(name = "action_required")
    private Boolean actionRequired = false;

    @Column(name = "action_taken", columnDefinition = "TEXT")
    private String actionTaken;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum AlertType {
        ALLERGY,
        DRUG_INTERACTION,
        CRITICAL_LAB,
        VITAL_SIGN_ABNORMAL,
        MEDICATION_DUE,
        MEDICATION_OVERDUE,
        ORDER_PENDING,
        APPOINTMENT_REMINDER,
        CLINICAL_RULE,
        SYSTEM_NOTIFICATION,
        PATIENT_SAFETY,
        INFECTION_CONTROL,
        FALL_RISK,
        PRESSURE_ULCER_RISK
    }

    public enum AlertCategory {
        CRITICAL,
        WARNING,
        INFORMATION,
        REMINDER
    }

    public enum AlertPriority {
        CRITICAL,
        HIGH,
        MEDIUM,
        LOW
    }

    public enum AlertStatus {
        ACTIVE,
        ACKNOWLEDGED,
        RESOLVED,
        EXPIRED,
        DISMISSED
    }
}

