package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.BatchSize;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "patients")
@Data
@EqualsAndHashCode(callSuper = false)
public class Patient extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "patient_code", unique = true, length = 20)
    private String patientCode;

    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(length = 20)
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(length = 30)
    private String phoneNumber;

    @Column(length = 150)
    private String email;

    @Column(length = 500)
    private String address;

    @Column(name = "address_line1", length = 500)
    private String addressLine1;

    @Column(name = "address_line2", length = 500)
    private String addressLine2;

    @Column(length = 50)
    private String city;

    @Column(length = 50)
    private String state;

    @Column(name = "zip_code", length = 10)
    private String zipCode;

    @Column(length = 50)
    private String country;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 30)
    private String emergencyContactPhone;

    @Column(name = "blood_group", length = 10)
    private String bloodGroup;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;

    @Column(length = 30)
    private String status; // ACTIVE, INACTIVE, DECEASED

    @Column(name = "insurance_provider", length = 100)
    private String insuranceProvider;

    @Column(name = "insurance_policy_number", length = 50)
    private String insurancePolicyNumber;

    @Column(name = "primary_doctor_id")
    private Long primaryDoctorId;

    // TODO: Uncomment after migration V33 runs and adds primary_provider_id column
    // @Column(name = "primary_provider_id", nullable = true)
    // private Long primaryProviderId;

    // JPA Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "primary_doctor_id", referencedColumnName = "staff_id", insertable = false, updatable = false)
    private Doctor primaryDoctor;
    
    // TODO: Uncomment after migration V33 runs and adds primary_provider_id column
    // @ManyToOne(fetch = FetchType.LAZY, optional = true)
    // @JoinColumn(name = "primary_provider_id", referencedColumnName = "staff_id", insertable = false, updatable = false)
    // private Staff primaryProvider;

    @OneToMany(mappedBy = "patient", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<Appointment> appointments;
}

