package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "clinical_notes")
@Data
@EqualsAndHashCode(callSuper = false)
public class ClinicalNote extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "note_id")
    private Long noteId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "author_staff_id", nullable = false)
    private Long authorStaffId;

    @Column(name = "note_type", length = 50, nullable = false)
    private String noteType; // Progress Note, Admission Note, Discharge Note, Procedure Note, etc.

    @Column(name = "note_title", length = 200)
    private String noteTitle;

    @Column(name = "note_content", columnDefinition = "TEXT", nullable = false)
    private String noteContent;

    @Column(name = "note_date_time", nullable = false)
    private LocalDateTime noteDateTime;

    @Column(name = "encounter_id")
    private Long encounterId; // Link to appointment/encounter

    @Column(name = "status", length = 20, nullable = false)
    private String status; // DRAFT, FINAL, AMENDED

    @Column(name = "is_signed", nullable = false)
    private Boolean isSigned = false;

    @Column(name = "signed_date_time")
    private LocalDateTime signedDateTime;

    @Column(name = "requires_cosign")
    private Boolean requiresCosign = false;

    @Column(name = "cosigned_by_staff_id")
    private Long cosignedByStaffId;

    @Column(name = "cosigned_date_time")
    private LocalDateTime cosignedDateTime;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_staff_id", insertable = false, updatable = false)
    private Staff authorStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cosigned_by_staff_id", insertable = false, updatable = false)
    private Staff cosignedByStaff;
}

