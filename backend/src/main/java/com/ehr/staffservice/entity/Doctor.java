package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.BatchSize;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "doctors")
@Data
@EqualsAndHashCode(callSuper = false)
public class Doctor extends BaseAuditEntity {

    @Id
    private Long staffId;   // same id as Staff

    @OneToOne
    @MapsId
    @JoinColumn(name = "staff_id")
    private Staff staff;

    @Column(name = "doctor_code", unique = true, length = 20)
    private String doctorCode;

    @Column(length = 150)
    private String specialization;

    private Integer yearsOfExperience;

    private BigDecimal consultationFee;

    @Column(length = 30)
    private String consultationType; // IN_PERSON/ONLINE/BOTH

    @Column(columnDefinition = "text")
    private String about;

    // Only for doctors:
    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<DoctorEducation> educations;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<DoctorCertification> certifications;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<DoctorAvailability> availabilities;

    @OneToMany(mappedBy = "doctor", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private List<DoctorLicense> licenses;
}

