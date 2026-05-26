package com.ehr.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Patient Encounter DTOs for MyChart Encounters page.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientEncounterDto {
    private Long encounterId;
    private String dateTime; // ISO datetime string
    private String type; // OFFICE_VISIT, VIRTUAL, URGENT_CARE, LAB, IMAGING
    private String department;
    private ProviderInfoDto provider;
    private String location;
    private String status; // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
    private String reason;
    private String summary;
    private EncounterLinksDto links;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProviderInfoDto {
        private Long id;
        private String name;
        private String specialty;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EncounterLinksDto {
        private String visitSummary; // route e.g. "/encounters/123/summary"
        private String bills; // "/billing?encounter=123"
        private String results; // "/results?encounter=123"
    }
}

