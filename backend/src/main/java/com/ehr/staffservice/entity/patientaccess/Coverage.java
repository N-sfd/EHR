package com.ehr.staffservice.entity.patientaccess;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "coverages", indexes = {
    @Index(name = "idx_coverage_patient", columnList = "patient_id"),
    @Index(name = "idx_coverage_status", columnList = "eligibility_status")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class Coverage extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "coverage_id")
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "payer", length = 200, nullable = false)
    private String payer; // Insurance company name

    @Column(name = "member_id", length = 50, nullable = false)
    private String memberId;

    @Column(name = "group_number", length = 50)
    private String groupNumber;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "eligibility_status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private EligibilityStatus eligibilityStatus;

    @Column(name = "copay", precision = 10, scale = 2)
    private BigDecimal copay;

    @Column(name = "deductible", precision = 10, scale = 2)
    private BigDecimal deductible;

    @Column(name = "is_primary")
    private Boolean isPrimary = true;

    public enum EligibilityStatus {
        ACTIVE,
        NOT_VERIFIED,
        EXPIRED,
        INACTIVE
    }
}

