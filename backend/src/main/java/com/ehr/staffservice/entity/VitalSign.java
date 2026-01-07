package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vital_signs")
@Data
@EqualsAndHashCode(callSuper = false)
public class VitalSign extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vital_sign_id")
    private Long vitalSignId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "recorded_by_staff_id")
    private Long recordedByStaffId;

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    // Temperature
    @Column(name = "temperature_f", precision = 5, scale = 2)
    private BigDecimal temperatureF;

    @Column(name = "temperature_c", precision = 5, scale = 2)
    private BigDecimal temperatureC;

    // Heart Rate
    @Column(name = "heart_rate")
    private Integer heartRate;

    // Blood Pressure
    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    // Respiratory Rate
    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    // Oxygen Saturation
    @Column(name = "spo2", precision = 5, scale = 2)
    private BigDecimal spo2;

    // Pain Score
    @Column(name = "pain_score")
    private Integer painScore; // 0-10 scale

    // Weight
    @Column(name = "weight_kg", precision = 6, scale = 2)
    private BigDecimal weightKg;

    @Column(name = "weight_lbs", precision = 6, scale = 2)
    private BigDecimal weightLbs;

    // Height
    @Column(name = "height_cm", precision = 6, scale = 2)
    private BigDecimal heightCm;

    @Column(name = "height_inches", precision = 6, scale = 2)
    private BigDecimal heightInches;

    // BMI
    @Column(name = "bmi", precision = 5, scale = 2)
    private BigDecimal bmi;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recorded_by_staff_id", insertable = false, updatable = false)
    private Staff recordedByStaff;
}

