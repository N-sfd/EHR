package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medications")
@Data
@EqualsAndHashCode(callSuper = false)
public class Medication extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medication_id")
    private Long medicationId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "medication_name", length = 200, nullable = false)
    private String medicationName;

    @Column(name = "generic_name", length = 200)
    private String genericName;

    @Column(name = "dosage", length = 100)
    private String dosage; // e.g., "10mg", "500mg"

    @Column(name = "dosage_unit", length = 20)
    private String dosageUnit; // mg, ml, units, etc.

    @Column(name = "frequency", length = 50)
    private String frequency; // "Once daily", "BID", "Q6H", etc.

    @Column(name = "route", length = 50)
    private String route; // Oral, IV, IM, Topical, etc.

    @Column(name = "quantity", precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "quantity_unit", length = 20)
    private String quantityUnit;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "prescribed_by_staff_id")
    private Long prescribedByStaffId;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // ACTIVE, DISCONTINUED, COMPLETED, ON_HOLD

    @Column(name = "indication", columnDefinition = "TEXT")
    private String indication; // Reason for medication

    @Column(name = "instructions", columnDefinition = "TEXT")
    private String instructions; // Patient instructions

    @Column(name = "is_prn", nullable = false)
    private Boolean isPrn = false;

    @Column(name = "prn_indication", columnDefinition = "TEXT")
    private String prnIndication; // When to take PRN meds

    @Column(name = "allergies_checked", nullable = false)
    private Boolean allergiesChecked = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescribed_by_staff_id", insertable = false, updatable = false)
    private Staff prescribedByStaff;
}

