package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "medication_administrations")
@Data
@EqualsAndHashCode(callSuper = false)
public class MedicationAdministration extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "administration_id")
    private Long administrationId;

    @Column(name = "medication_id", nullable = false)
    private Long medicationId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "administered_time")
    private LocalDateTime administeredTime;

    @Column(name = "administered_by_staff_id")
    private Long administeredByStaffId;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // SCHEDULED, GIVEN, REFUSED, HELD, MISSED, NOT_DUE

    @Column(name = "dose_given", length = 100)
    private String doseGiven; // Actual dose administered

    @Column(name = "route_used", length = 50)
    private String routeUsed; // Route actually used

    @Column(name = "site", length = 100)
    private String site; // Injection site, IV site, etc.

    @Column(name = "reason_held", columnDefinition = "TEXT")
    private String reasonHeld; // Why medication was held

    @Column(name = "reason_refused", columnDefinition = "TEXT")
    private String reasonRefused; // Why patient refused

    @Column(name = "witness_staff_id")
    private Long witnessStaffId; // For controlled substances

    @Column(name = "waste_witness_staff_id")
    private Long wasteWitnessStaffId; // For waste documentation

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medication_id", insertable = false, updatable = false)
    private Medication medication;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "administered_by_staff_id", insertable = false, updatable = false)
    private Staff administeredByStaff;
}

