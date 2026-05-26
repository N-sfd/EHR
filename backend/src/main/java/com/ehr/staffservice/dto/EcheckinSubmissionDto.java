package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * DTO for eCheck-in submission.
 * Contains all data collected during the eCheck-in wizard.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EcheckinSubmissionDto {
    
    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @Valid
    private DemographicsData demographics;

    @Valid
    private ContactData contact;

    @Valid
    private InsuranceData insurance;

    @Valid
    private ConsentsData consents;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant submittedAt;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DemographicsData {
        private String addressLine1;
        private String addressLine2;
        private String city;
        private String state;
        private String zip;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactData {
        private String phoneNumber;
        private String email;
        private String preferredMethod; // phone, email, text
        private Boolean consentSms;
        private Boolean consentEmail;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InsuranceData {
        private String payerName;
        private String memberId;
        private String groupNumber;
        private String effectiveFrom;
        private String effectiveTo;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsentsData {
        private Boolean hipaaConsent;
        private Boolean treatmentConsent;
        private Boolean financialConsent;
    }
}

