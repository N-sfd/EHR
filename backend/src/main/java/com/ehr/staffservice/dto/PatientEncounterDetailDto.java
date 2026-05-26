package com.ehr.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Detailed encounter DTO with additional information.
 */
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PatientEncounterDetailDto extends PatientEncounterDto {
    private List<String> diagnoses;
    private String notes;
    private List<VitalDto> vitals;
    private List<MedicationChangeDto> medicationsChanged;
    private List<OrderDto> orders;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VitalDto {
        private String label;
        private String value;
        private String unit;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicationChangeDto {
        private String name;
        private String change; // "Added", "Stopped", "Dosage changed"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderDto {
        private String type; // LAB, IMAGING, REFERRAL
        private String name;
        private String status;
    }
}

