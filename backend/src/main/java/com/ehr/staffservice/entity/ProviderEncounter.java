package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "provider_encounters")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProviderEncounter extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "encounter_date_time", nullable = false)
    private LocalDateTime encounterDateTime;

    // Assessment
    @Column(name = "assessment", columnDefinition = "TEXT")
    private String assessment;

    @Column(name = "diagnosis_codes", columnDefinition = "TEXT")
    private String diagnosisCodes; // ICD-10 codes, comma-separated

    @Column(name = "diagnosis_descriptions", columnDefinition = "TEXT")
    private String diagnosisDescriptions;

    @Column(name = "primary_diagnosis", length = 200)
    private String primaryDiagnosis;

    // Plan
    @Column(name = "plan", columnDefinition = "TEXT")
    private String plan;

    @Column(name = "follow_up_instructions", columnDefinition = "TEXT")
    private String followUpInstructions;

    @Column(name = "follow_up_appointment_needed")
    private Boolean followUpAppointmentNeeded = false;

    @Column(name = "follow_up_days")
    private Integer followUpDays;

    // SOAP Notes
    @Column(name = "subjective", columnDefinition = "TEXT")
    private String subjective;

    @Column(name = "objective", columnDefinition = "TEXT")
    private String objective;

    @Column(name = "assessment_soap", columnDefinition = "TEXT")
    private String assessmentSoap;

    @Column(name = "plan_soap", columnDefinition = "TEXT")
    private String planSoap;

    // Orders Summary (references to Orders entity)
    @Column(name = "orders_placed")
    private Boolean ordersPlaced = false;

    @Column(name = "lab_orders_count")
    private Integer labOrdersCount = 0;

    @Column(name = "imaging_orders_count")
    private Integer imagingOrdersCount = 0;

    @Column(name = "medication_orders_count")
    private Integer medicationOrdersCount = 0;

    // Status
    @Column(name = "is_signed")
    private Boolean isSigned = false;

    @Column(name = "signed_date_time")
    private LocalDateTime signedDateTime;

    @Column(name = "signed_by_staff_id")
    private Long signedByStaffId;

    @Column(name = "is_complete")
    private Boolean isComplete = false;

    @Column(name = "completed_date_time")
    private LocalDateTime completedDateTime;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

