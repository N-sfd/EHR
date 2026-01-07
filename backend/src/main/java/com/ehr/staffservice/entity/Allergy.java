package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Table(name = "allergies")
@Data
@EqualsAndHashCode(callSuper = false)
public class Allergy extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "allergy_id")
    private Long allergyId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "allergen", length = 200, nullable = false)
    private String allergen; // e.g., "Penicillins", "Codeine"

    @Column(name = "allergy_type", length = 50)
    private String allergyType; // Drug, Food, Environmental, etc.

    @Column(name = "severity", length = 20)
    private String severity; // Mild, Moderate, Severe, Life-threatening

    @Column(name = "reaction", columnDefinition = "TEXT")
    private String reaction; // Description of the reaction

    @Column(name = "onset_date")
    private LocalDate onsetDate;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // ACTIVE, INACTIVE, RESOLVED

    @Column(name = "verified_by_staff_id")
    private Long verifiedByStaffId;

    @Column(name = "verified_date")
    private LocalDate verifiedDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by_staff_id", insertable = false, updatable = false)
    private Staff verifiedByStaff;
}

