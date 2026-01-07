package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Table(name = "doctor_certifications")
@Data
@EqualsAndHashCode(callSuper = false)
public class DoctorCertification extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private Doctor doctor;

    private String name;
    private String issuedBy;
    private LocalDate issueDate;
    private LocalDate expiryDate;
}

