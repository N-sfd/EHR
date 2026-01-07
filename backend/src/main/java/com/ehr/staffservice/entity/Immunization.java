package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "immunizations")
@Data
@EqualsAndHashCode(callSuper = false)
public class Immunization extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "vaccine_name", nullable = false, length = 200)
    private String vaccineName;

    @Column(name = "cvx_code", length = 10)
    private String cvxCode; // CDC Vaccine Code

    @Column(name = "ndc_code", length = 20)
    private String ndcCode; // National Drug Code

    @Column(name = "manufacturer", length = 200)
    private String manufacturer;

    @Column(name = "lot_number", length = 100)
    private String lotNumber;

    @Column(name = "administration_date", nullable = false)
    private LocalDate administrationDate;

    @Column(name = "expiration_date")
    private LocalDate expirationDate;

    @Column(name = "administered_by_staff_id")
    private Long administeredByStaffId;

    @Column(name = "route", length = 50)
    private String route; // IM, SC, Oral, etc.

    @Column(name = "site", length = 100)
    private String site; // Left arm, Right arm, etc.

    @Column(name = "dose", length = 50)
    private String dose;

    @Column(name = "dose_unit", length = 20)
    private String doseUnit; // mL, mg, etc.

    @Column(name = "series_number")
    private Integer seriesNumber; // 1, 2, 3, etc. for multi-dose vaccines

    @Column(name = "information_source", length = 100)
    private String informationSource; // Historical, Other Provider, Registry, etc.

    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ImmunizationStatus status;

    @Column(name = "vis_date")
    private LocalDate visDate; // Vaccine Information Statement date

    @Column(name = "vis_version", length = 20)
    private String visVersion;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "reaction", columnDefinition = "TEXT")
    private String reaction; // Any adverse reactions

    public enum ImmunizationStatus {
        COMPLETED,
        REFUSED,
        NOT_GIVEN,
        PARTIALLY_ADMINISTERED
    }
}

