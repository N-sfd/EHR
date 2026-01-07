package com.ehr.staffservice.entity.patientaccess;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity(name = "PatientAccessPatient")
@Table(name = "patient_access_patients", indexes = {
    @Index(name = "idx_patient_mrn", columnList = "mrn"),
    @Index(name = "idx_patient_name", columnList = "firstName, lastName")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class Patient extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "patient_id")
    private Long id;

    @Column(name = "mrn", unique = true, length = 50, nullable = false)
    private String mrn; // Medical Record Number

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "sex", length = 20)
    private String sex; // MALE, FEMALE, OTHER

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 50)
    private String state;

    @Column(name = "zip_code", length = 20)
    private String zipCode;

    @Column(name = "country", length = 50)
    private String country;

    @ElementCollection
    @CollectionTable(name = "patient_alerts", joinColumns = @JoinColumn(name = "patient_id"))
    @Column(name = "alert")
    private List<String> alerts = new ArrayList<>(); // e.g., "ALLERGY_PENICILLIN", "FALL_RISK"
}

