package com.ehr.staffservice.dto.fhir;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * FHIR Patient resource DTO.
 * Maps to FHIR R4 Patient resource structure.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FhirPatientDto {
    
    private String resourceType = "Patient";
    private String id;
    private List<Identifier> identifier = new ArrayList<>();
    private List<HumanName> name = new ArrayList<>();
    private String gender; // male, female, other, unknown
    private LocalDate birthDate;
    private List<ContactPoint> telecom = new ArrayList<>();
    private List<Address> address = new ArrayList<>();
    private List<Contact> contact = new ArrayList<>();
    private List<Communication> communication = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Identifier {
        private String system;
        private String value;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HumanName {
        private String use; // usual, official, temp, nickname, anonymous, old, maiden
        private List<String> given = new ArrayList<>();
        private String family;
        private String text; // Full name as text
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactPoint {
        private String system; // phone, fax, email, pager, url, sms, other
        private String value;
        private String use; // home, work, temp, old, mobile
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Address {
        private List<String> line = new ArrayList<>();
        private String city;
        private String state;
        private String postalCode;
        private String country;
        private String use; // home, work, temp, old, billing
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Contact {
        private List<CodeableConcept> relationship = new ArrayList<>();
        private HumanName name;
        private List<ContactPoint> telecom = new ArrayList<>();
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
    public static class Communication {
        private CodeableConcept language;
        private Boolean preferred;
    }
}

