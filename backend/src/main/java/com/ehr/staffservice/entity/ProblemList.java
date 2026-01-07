package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "problem_lists")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProblemList extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "problem_name", nullable = false, length = 500)
    private String problemName;

    @Column(name = "icd10_code", length = 20)
    private String icd10Code;

    @Column(name = "icd10_description", length = 1000)
    private String icd10Description;

    @Column(name = "snomed_code", length = 20)
    private String snomedCode;

    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ProblemStatus status;

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "diagnosed_by_staff_id")
    private Long diagnosedByStaffId;

    @Column(name = "resolved_by_staff_id")
    private Long resolvedByStaffId;

    @Column(name = "severity", length = 50)
    @Enumerated(EnumType.STRING)
    private ProblemSeverity severity;

    @Column(name = "chronic", nullable = false)
    private Boolean chronic = false;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "priority", length = 50)
    @Enumerated(EnumType.STRING)
    private ProblemPriority priority;

    public enum ProblemStatus {
        ACTIVE,
        RESOLVED,
        INACTIVE,
        REMOVED
    }

    public enum ProblemSeverity {
        MILD,
        MODERATE,
        SEVERE,
        CRITICAL
    }

    public enum ProblemPriority {
        HIGH,
        MEDIUM,
        LOW
    }
}

