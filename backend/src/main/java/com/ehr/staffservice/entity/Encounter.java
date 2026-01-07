package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "encounters")
@Data
@EqualsAndHashCode(callSuper = false)
public class Encounter extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encounter_number", unique = true, length = 50)
    private String encounterNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "encounter_type", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EncounterType encounterType;

    @Column(name = "encounter_status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private EncounterStatus encounterStatus;

    @Column(name = "check_in_date_time")
    private LocalDateTime checkInDateTime;

    @Column(name = "check_in_by_staff_id")
    private Long checkInByStaffId;

    @Column(name = "check_out_date_time")
    private LocalDateTime checkOutDateTime;

    @Column(name = "check_out_by_staff_id")
    private Long checkOutByStaffId;

    @Column(name = "arrival_date_time")
    private LocalDateTime arrivalDateTime;

    @Column(name = "room_assigned", length = 50)
    private String roomAssigned;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "primary_provider_id")
    private Long primaryProviderId;

    @Column(name = "chief_complaint", columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "visit_reason", columnDefinition = "TEXT")
    private String visitReason;

    @Column(name = "registration_complete")
    private Boolean registrationComplete = false;

    @Column(name = "registration_complete_date")
    private LocalDateTime registrationCompleteDate;

    @Column(name = "registration_complete_by_staff_id")
    private Long registrationCompleteByStaffId;

    @Column(name = "insurance_verified")
    private Boolean insuranceVerified = false;

    @Column(name = "eligibility_verified")
    private Boolean eligibilityVerified = false;

    @Column(name = "copay_collected")
    private Boolean copayCollected = false;

    @Column(name = "copay_amount")
    private Double copayAmount;

    @Column(name = "wait_time_minutes")
    private Integer waitTimeMinutes;

    @Column(name = "visit_duration_minutes")
    private Integer visitDurationMinutes;

    @Column(name = "discharge_disposition", length = 100)
    private String dischargeDisposition;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum EncounterType {
        OUTPATIENT,
        INPATIENT,
        EMERGENCY,
        URGENT_CARE,
        AMBULATORY,
        OBSERVATION,
        SURGERY,
        PROCEDURE,
        CONSULTATION,
        FOLLOW_UP
    }

    public enum EncounterStatus {
        SCHEDULED,
        ARRIVED,
        CHECKED_IN,
        IN_PROGRESS,
        CHECKED_OUT,
        DISCHARGED,
        CANCELLED,
        NO_SHOW
    }
}

