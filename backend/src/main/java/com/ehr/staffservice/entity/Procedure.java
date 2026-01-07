package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "procedures")
@Data
@EqualsAndHashCode(callSuper = false)
public class Procedure extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "procedure_name", nullable = false, length = 500)
    private String procedureName;

    @Column(name = "cpt_code", length = 20)
    private String cptCode; // Current Procedural Terminology

    @Column(name = "icd10_pcs_code", length = 20)
    private String icd10PcsCode; // ICD-10 Procedure Coding System

    @Column(name = "procedure_description", columnDefinition = "TEXT")
    private String procedureDescription;

    @Column(name = "procedure_date", nullable = false)
    private LocalDate procedureDate;

    @Column(name = "procedure_time")
    private LocalDateTime procedureTime;

    @Column(name = "performed_by_staff_id")
    private Long performedByStaffId;

    @Column(name = "assisted_by_staff_ids", length = 500)
    private String assistedByStaffIds; // Comma-separated staff IDs

    @Column(name = "location", length = 200)
    private String location; // Operating room, clinic, etc.

    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ProcedureStatus status;

    @Column(name = "anesthesia_type", length = 100)
    private String anesthesiaType; // General, Local, Regional, None

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "indication", columnDefinition = "TEXT")
    private String indication; // Why the procedure was performed

    @Column(name = "findings", columnDefinition = "TEXT")
    private String findings;

    @Column(name = "complications", columnDefinition = "TEXT")
    private String complications;

    @Column(name = "post_procedure_instructions", columnDefinition = "TEXT")
    private String postProcedureInstructions;

    @Column(name = "follow_up_required")
    private Boolean followUpRequired = false;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum ProcedureStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }
}

