package com.ehr.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Patient Profile DTO for MyChart Profile page.
 * Epic-style patient profile with demographics, PCP, coverage, and registration status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientProfileDto {
    
    private PatientInfoDto patient;
    private PcpInfoDto pcp;
    private CoverageSummaryDto coverageSummary;
    private RegistrationStatusDto registrationStatus;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PatientInfoDto {
        private Long id;
        private String mrn;
        private String firstName;
        private String lastName;
        private String displayName;
        private String dob; // ISO date string
        private String sex; // MALE, FEMALE, OTHER, UNKNOWN
        private String phone;
        private String email;
        private AddressDto address;
        private String preferredLanguage;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AddressDto {
        private String line1;
        private String line2;
        private String city;
        private String state;
        private String zip;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PcpInfoDto {
        private Long providerId;
        private String name;
        private String specialty;
        private String photoUrl;
        private String messageRoute; // "/messages/new?to=123"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverageSummaryDto {
        private Boolean hasActiveCoverage;
        private String payerName;
        private String memberIdMasked; // Last 4 digits only
        private String planType;
        private String effectiveFrom; // ISO date string
        private String effectiveTo; // ISO date string
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RegistrationStatusDto {
        private Integer percentComplete; // 0-100
        private List<MissingFieldDto> missingFields;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissingFieldDto {
        private String group; // DEMOGRAPHICS, COVERAGE, CONTACT, CONSENTS
        private String field; // "addressLine1", "zip", etc
        private String label; // "Address Line 1"
        private String severity; // INFO, WARNING, CRITICAL
    }
}

