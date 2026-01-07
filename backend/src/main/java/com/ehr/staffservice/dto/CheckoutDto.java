package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class CheckoutDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Encounter ID is required")
    private Long encounterId;

    private Long appointmentId;
    private Long patientId;
    private Long checkedOutByStaffId;
    private LocalDateTime checkoutDateTime;
    
    // Follow-up
    private Boolean followUpAppointmentScheduled = false;
    private Long followUpAppointmentId;
    private LocalDateTime followUpDate;
    private Long followUpProviderId;
    private String followUpReason;
    
    // Referrals
    private Boolean referralsMade = false;
    private String referralSpecialty;
    private String referralProviderName;
    private String referralNotes;
    
    // Instructions
    private String patientInstructions;
    private String medicationInstructions;
    private String activityRestrictions;
    private String dietInstructions;
    private String whenToReturn;
    
    // Billing
    private Boolean billingCaptured = false;
    private Long billingCapturedByStaffId;
    private LocalDateTime billingCapturedDateTime;
    private Boolean copayCollected = false;
    private Double copayAmount;
    private String paymentMethod;
    
    // Discharge
    private String dischargeDisposition;
    private Boolean dischargeInstructionsProvided = false;
    private Boolean patientUnderstoodInstructions = false;
    private Boolean isComplete = false;
    private LocalDateTime completedDateTime;
    private String notes;
}

