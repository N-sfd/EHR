package com.ehr.staffservice.dto.fhir;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * FHIR Coverage resource DTO.
 * Maps to FHIR R4 Coverage resource structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FhirCoverageDto {
    
    private String resourceType = "Coverage";
    private String id;
    private String status; // active, cancelled, draft, entered-in-error
    private Reference beneficiary; // Patient reference
    private String subscriberId;
    private Reference subscriber; // Subscriber Patient reference
    private List<Reference> payor = new ArrayList<>();
    private CodeableConcept relationship;
    private Period period;
    private List<Class> classList = new ArrayList<>();
    private Integer order; // 1=primary, 2=secondary, etc.

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Reference {
        private String reference; // e.g., "Patient/patient1"
        private String display; // Human-readable name
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

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Period {
        private LocalDate start;
        private LocalDate end;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Class {
        private CodeableConcept type; // group, plan, etc.
        private String value;
    }
}

