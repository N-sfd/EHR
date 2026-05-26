package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patient_medication")
@Data
@EqualsAndHashCode
public class PatientMedication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "medication_id")
    private Long medicationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "medication_name", nullable = false, length = 200)
    private String medicationName;

    @Column(name = "common_name", length = 200)
    private String commonName;

    @Column(nullable = false, length = 100)
    private String dosage;

    @Column(nullable = false, length = 100)
    private String frequency;

    @Lob
    private String instructions;

    @Column(name = "prescribed_date", nullable = false)
    private LocalDate prescribedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescriber_id")
    private Staff prescriber;

    @Column(name = "prescription_number", length = 50)
    private String prescriptionNumber;

    @Column(length = 50)
    private String quantity;

    @Column(name = "day_supply")
    private Integer daySupply;

    @Column(name = "pharmacy_name", length = 200)
    private String pharmacyName;

    @Column(name = "pharmacy_address", length = 255)
    private String pharmacyAddress;

    @Column(name = "pharmacy_city", length = 100)
    private String pharmacyCity;

    @Column(name = "pharmacy_state", length = 50)
    private String pharmacyState;

    @Column(name = "pharmacy_zip", length = 20)
    private String pharmacyZip;

    @Column(name = "pharmacy_phone", length = 50)
    private String pharmacyPhone;

    @Column(name = "refills_remaining")
    private Integer refillsRemaining = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "is_external", nullable = false)
    private Boolean isExternal = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.refillsRemaining == null) {
            this.refillsRemaining = 0;
        }
        if (this.isActive == null) {
            this.isActive = true;
        }
        if (this.isExternal == null) {
            this.isExternal = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

