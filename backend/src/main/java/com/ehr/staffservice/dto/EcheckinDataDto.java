package com.ehr.staffservice.dto;

import com.ehr.staffservice.dto.fhir.FhirPatientDto;
import com.ehr.staffservice.dto.fhir.FhirCoverageDto;
import com.ehr.staffservice.dto.fhir.FhirConsentDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO for eCheck-in wizard initialization data.
 * Returned by GET /api/appointments/{id}/echeckin
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EcheckinDataDto {
    
    private AppointmentSummaryDto appointment;
    private FhirPatientDto patient;
    private List<FhirCoverageDto> coverages;
    private List<FhirConsentDto> requiredConsents;
    private RegistrationCompletenessDto completeness;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AppointmentSummaryDto {
        private Long appointmentId;
        private String appointmentDate;
        private String appointmentTime;
        private String providerName;
        private String departmentName;
        private String visitType;
        private String status; // PENDING, PRECHECKIN_COMPLETE, COMPLETE, etc.
    }
}

