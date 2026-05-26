package com.ehr.staffservice.dto.fhir;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * FHIR Consent resource DTO.
 * Maps to FHIR R4 Consent resource structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FhirConsentDto {
    
    private String resourceType = "Consent";
    private String id;
    private String status; // draft, proposed, active, rejected, inactive, entered-in-error
    private List<CodeableConcept> category = new ArrayList<>();
    private Reference patient;
    private Instant dateTime;
    private CodeableConcept policyRule;
    private String version; // Consent version/rule identifier

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reference {
        private String reference; // e.g., "Patient/patient1"
        private String display;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeableConcept {
        private String text;
        private List<Coding> coding = new ArrayList<>();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Coding {
        private String system;
        private String code;
        private String display;
    }
}

