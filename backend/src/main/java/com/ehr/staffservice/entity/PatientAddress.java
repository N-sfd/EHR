package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Entity
@Table(name = "patient_addresses")
@Data
@EqualsAndHashCode(callSuper = false)
public class PatientAddress extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "address_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private AddressType addressType;

    @Column(name = "address_line1", nullable = false, length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state_province", length = 100)
    private String stateProvince;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "is_primary")
    private Boolean isPrimary = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum AddressType {
        PERMANENT,
        PREVIOUS,
        MAILING,
        TEMPORARY,
        SECONDARY
    }
}

