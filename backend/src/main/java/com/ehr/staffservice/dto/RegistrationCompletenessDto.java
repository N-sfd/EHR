package com.ehr.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Registration Completeness DTO for Epic-style patient portal.
 * Provides detailed completeness information with weighted sections.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationCompletenessDto {
    
    private Integer overallPercent; // 0-100
    private CompletenessStatus status; // COMPLETE, INCOMPLETE, CRITICAL
    private List<SectionCompletenessDto> sections;
    private List<MissingFieldDto> missingFields;
    private List<String> blockingFlags; // BILLING_BLOCK, ECHECKIN_BLOCK, etc.

    public enum CompletenessStatus {
        COMPLETE,      // 100% complete, all required fields present
        INCOMPLETE,    // Some optional fields missing, but can proceed
        CRITICAL       // Required fields missing, blocks billing/check-in
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectionCompletenessDto {
        private String code; // DEMOGRAPHICS, CONTACT, EMERGENCY, INSURANCE, GUARANTOR, CONSENTS, CLINICAL_BASICS
        private Integer percent; // 0-100 for this section
        private Boolean required; // Whether this section is required
        private Integer weight; // Weight percentage (25, 15, 10, etc.)
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissingFieldDto {
        private String section; // DEMOGRAPHICS, CONTACT, etc.
        private String field; // addressLine1, zip, etc.
        private String severity; // CRITICAL, WARNING, INFO
        private String message; // Human-readable message explaining why it's needed
        private String deepLinkRoute; // Route to profile section, e.g., "/profile/personal?focus=addressLine1"
        private String fhirPath; // FHIR path, e.g., "Patient.address[0].postalCode"
    }
}

