package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "checkouts")
@Data
@EqualsAndHashCode(callSuper = false)
public class Checkout extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "encounter_id", nullable = false)
    private Long encounterId;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "checked_out_by_staff_id", nullable = false)
    private Long checkedOutByStaffId;

    @Column(name = "checkout_date_time", nullable = false)
    private LocalDateTime checkoutDateTime;

    // Follow-up Appointment
    @Column(name = "follow_up_appointment_scheduled")
    private Boolean followUpAppointmentScheduled = false;

    @Column(name = "follow_up_appointment_id")
    private Long followUpAppointmentId;

    @Column(name = "follow_up_date")
    private LocalDateTime followUpDate;

    @Column(name = "follow_up_provider_id")
    private Long followUpProviderId;

    @Column(name = "follow_up_reason", columnDefinition = "TEXT")
    private String followUpReason;

    // Referrals
    @Column(name = "referrals_made")
    private Boolean referralsMade = false;

    @Column(name = "referral_specialty", length = 200)
    private String referralSpecialty;

    @Column(name = "referral_provider_name", length = 200)
    private String referralProviderName;

    @Column(name = "referral_notes", columnDefinition = "TEXT")
    private String referralNotes;

    // Patient Instructions
    @Column(name = "patient_instructions", columnDefinition = "TEXT")
    private String patientInstructions;

    @Column(name = "medication_instructions", columnDefinition = "TEXT")
    private String medicationInstructions;

    @Column(name = "activity_restrictions", columnDefinition = "TEXT")
    private String activityRestrictions;

    @Column(name = "diet_instructions", columnDefinition = "TEXT")
    private String dietInstructions;

    @Column(name = "when_to_return", columnDefinition = "TEXT")
    private String whenToReturn;

    // Billing
    @Column(name = "billing_captured")
    private Boolean billingCaptured = false;

    @Column(name = "billing_captured_by_staff_id")
    private Long billingCapturedByStaffId;

    @Column(name = "billing_captured_date_time")
    private LocalDateTime billingCapturedDateTime;

    @Column(name = "copay_collected")
    private Boolean copayCollected = false;

    @Column(name = "copay_amount")
    private Double copayAmount;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod; // Cash, Credit Card, Check, etc.

    // Discharge
    @Column(name = "discharge_disposition", length = 100)
    private String dischargeDisposition; // Home, Hospital, Skilled Nursing, etc.

    @Column(name = "discharge_instructions_provided")
    private Boolean dischargeInstructionsProvided = false;

    @Column(name = "patient_understood_instructions")
    private Boolean patientUnderstoodInstructions = false;

    @Column(name = "is_complete")
    private Boolean isComplete = false;

    @Column(name = "completed_date_time")
    private LocalDateTime completedDateTime;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

