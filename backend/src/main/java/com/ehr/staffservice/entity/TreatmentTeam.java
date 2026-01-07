package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "treatment_teams")
@Data
@EqualsAndHashCode(callSuper = false)
public class TreatmentTeam extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "treatment_team_id")
    private Long treatmentTeamId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "staff_id", nullable = false)
    private Long staffId;

    @Column(name = "relationship", length = 50, nullable = false)
    private String relationship; // Attending, Resident, Registered Nurse, Case Manager, etc.

    @Column(name = "specialty", length = 100)
    private String specialty;

    @Column(name = "contact_phone", length = 30)
    private String contactPhone;

    @Column(name = "contact_email", length = 150)
    private String contactEmail;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // ACTIVE, INACTIVE

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", insertable = false, updatable = false)
    private Staff staff;
}

