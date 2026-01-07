package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Data
public class EncounterDto {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String encounterNumber;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    private Long appointmentId;
    private String encounterType; // OUTPATIENT, INPATIENT, EMERGENCY, etc.
    private String encounterStatus; // SCHEDULED, ARRIVED, CHECKED_IN, etc.
    
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private LocalDateTime checkInDateTime;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long checkInByStaffId;

    private LocalDateTime checkOutDateTime;
    private Long checkOutByStaffId;
    private LocalDateTime arrivalDateTime;
    private String roomAssigned;
    private String location;
    private Long departmentId;
    private Long primaryProviderId;
    private String chiefComplaint;
    private String visitReason;
    private Boolean registrationComplete = false;
    private LocalDateTime registrationCompleteDate;
    private Long registrationCompleteByStaffId;
    private Boolean insuranceVerified = false;
    private Boolean eligibilityVerified = false;
    private Boolean copayCollected = false;
    private Double copayAmount;
    private Integer waitTimeMinutes;
    private Integer visitDurationMinutes;
    private String dischargeDisposition;
    private String notes;
}

