package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Data
@EqualsAndHashCode(callSuper = false)
public class LabResult extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lab_result_id")
    private Long labResultId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "order_id")
    private Long orderId; // Link to order if applicable

    @Column(name = "test_name", length = 200, nullable = false)
    private String testName; // e.g., "Complete Blood Count", "Glucose"

    @Column(name = "test_code", length = 50)
    private String testCode; // LOINC code or internal code

    @Column(name = "test_category", length = 100)
    private String testCategory; // Hematology, Chemistry, Microbiology, etc.

    @Column(name = "result_value", length = 200)
    private String resultValue; // The actual result

    @Column(name = "numeric_value", precision = 10, scale = 2)
    private BigDecimal numericValue; // If result is numeric

    @Column(name = "unit", length = 20)
    private String unit; // mg/dL, mmol/L, etc.

    @Column(name = "reference_range", length = 100)
    private String referenceRange; // Normal range

    @Column(name = "flag", length = 20)
    private String flag; // NORMAL, HIGH, LOW, CRITICAL

    @Column(name = "collected_date_time")
    private LocalDateTime collectedDateTime;

    @Column(name = "resulted_date_time")
    private LocalDateTime resultedDateTime;

    @Column(name = "collected_by_staff_id")
    private Long collectedByStaffId;

    @Column(name = "resulted_by_staff_id")
    private Long resultedByStaffId;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // PENDING, COMPLETED, CANCELLED, CORRECTED

    @Column(name = "is_critical", nullable = false)
    private Boolean isCritical = false;

    @Column(name = "critical_value_notified", nullable = false)
    private Boolean criticalValueNotified = false;

    @Column(name = "notified_to_staff_id")
    private Long notifiedToStaffId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;
}

