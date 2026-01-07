package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rooming")
@Data
@EqualsAndHashCode(callSuper = false)
public class Rooming extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "roomed_by_staff_id", nullable = false)
    private Long roomedByStaffId;

    @Column(name = "roomed_date_time", nullable = false)
    private LocalDateTime roomedDateTime;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    // Vitals
    @Column(name = "blood_pressure_systolic")
    private Integer bloodPressureSystolic;

    @Column(name = "blood_pressure_diastolic")
    private Integer bloodPressureDiastolic;

    @Column(name = "temperature_f")
    private BigDecimal temperatureF;

    @Column(name = "temperature_c")
    private BigDecimal temperatureC;

    @Column(name = "pulse")
    private Integer pulse;

    @Column(name = "respiratory_rate")
    private Integer respiratoryRate;

    @Column(name = "oxygen_saturation")
    private BigDecimal oxygenSaturation;

    @Column(name = "height_inches")
    private BigDecimal heightInches;

    @Column(name = "height_cm")
    private BigDecimal heightCm;

    @Column(name = "weight_lbs")
    private BigDecimal weightLbs;

    @Column(name = "weight_kg")
    private BigDecimal weightKg;

    @Column(name = "bmi")
    private BigDecimal bmi;

    @Column(name = "pain_score")
    private Integer painScore; // 0-10

    // Chief Complaint and History
    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "history_of_present_illness", columnDefinition = "TEXT")
    private String historyOfPresentIllness;

    @Column(name = "medications_reviewed")
    private Boolean medicationsReviewed = false;

    @Column(name = "allergies_reviewed")
    private Boolean allergiesReviewed = false;

    // Screening
    @Column(name = "smoking_status", length = 50)
    private String smokingStatus; // Never, Former, Current

    @Column(name = "fall_risk_assessment")
    private Boolean fallRiskAssessment = false;

    @Column(name = "fall_risk_score")
    private Integer fallRiskScore;

    @Column(name = "depression_screening")
    private Boolean depressionScreening = false;

    @Column(name = "depression_screening_score")
    private Integer depressionScreeningScore;

    @Column(name = "alcohol_screening")
    private Boolean alcoholScreening = false;

    // Additional Information
    @Column(name = "patient_concerns", columnDefinition = "TEXT")
    private String patientConcerns;

    @Column(name = "nursing_notes", columnDefinition = "TEXT")
    private String nursingNotes;

    @Column(name = "is_complete")
    private Boolean isComplete = false;

    @Column(name = "completed_date_time")
    private LocalDateTime completedDateTime;
}

