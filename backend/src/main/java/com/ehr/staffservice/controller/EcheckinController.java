package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.EcheckinDataDto;
import com.ehr.staffservice.dto.fhir.FhirPatientDto;
import com.ehr.staffservice.dto.fhir.FhirCoverageDto;
import com.ehr.staffservice.dto.fhir.FhirConsentDto;
import com.ehr.staffservice.service.EcheckinService;
import com.ehr.staffservice.service.FhirService;
import com.ehr.staffservice.service.SessionService;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller for eCheck-in functionality.
 * Handles eCheck-in submission and status checks.
 */
@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class EcheckinController {

    private final EcheckinService echeckinService;
    private final FhirService fhirService;

    /**
     * Get eCheck-in wizard initialization data.
     * GET /api/appointments/{id}/echeckin
     * Returns appointment summary, Patient resource, Coverage list, Consents list, completeness snapshot.
     */
    @GetMapping("/appointments/{id}/echeckin")
    public ResponseEntity<EcheckinDataDto> getEcheckinData(
            @PathVariable Long id,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("Getting eCheck-in data for appointmentId: {}, patientId: {}", id, patientId);

        try {
            EcheckinDataDto data = echeckinService.getEcheckinData(patientId, id);
            return ResponseEntity.ok(data);
        } catch (Exception e) {
            log.error("Error getting eCheck-in data: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get eCheck-in data: " + e.getMessage(), e);
        }
    }

    /**
     * Save demographics step (atomic update).
     * PATCH /api/appointments/{id}/echeckin/demographics
     * Updates Patient address.
     */
    @PatchMapping("/appointments/{id}/echeckin/demographics")
    public ResponseEntity<FhirPatientDto> saveDemographics(
            @PathVariable Long id,
            @Valid @RequestBody FhirPatientDto patient,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("Saving demographics for appointmentId: {}, patientId: {}", id, patientId);

        FhirPatientDto updated = fhirService.updatePatient(patientId, patient);
        return ResponseEntity.ok(updated);
    }

    /**
     * Save contact step (atomic update).
     * PATCH /api/appointments/{id}/echeckin/contact
     * Updates telecom + preferences.
     */
    @PatchMapping("/appointments/{id}/echeckin/contact")
    public ResponseEntity<FhirPatientDto> saveContact(
            @PathVariable Long id,
            @Valid @RequestBody FhirPatientDto patient,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("Saving contact for appointmentId: {}, patientId: {}", id, patientId);

        FhirPatientDto updated = fhirService.updatePatient(patientId, patient);
        return ResponseEntity.ok(updated);
    }

    /**
     * Save coverage step (upsert).
     * PUT /api/appointments/{id}/echeckin/coverage
     * Upserts coverage.
     */
    @PutMapping("/appointments/{id}/echeckin/coverage")
    public ResponseEntity<FhirCoverageDto> saveCoverage(
            @PathVariable Long id,
            @Valid @RequestBody FhirCoverageDto coverage,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("Saving coverage for appointmentId: {}, patientId: {}", id, patientId);

        FhirCoverageDto result = fhirService.upsertCoverage(patientId, coverage);
        return ResponseEntity.ok(result);
    }

    /**
     * Save consent step.
     * POST /api/appointments/{id}/echeckin/consent
     * Saves consent.
     */
    @PostMapping("/appointments/{id}/echeckin/consent")
    public ResponseEntity<FhirConsentDto> saveConsent(
            @PathVariable Long id,
            @Valid @RequestBody FhirConsentDto consent,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("Saving consent for appointmentId: {}, patientId: {}", id, patientId);

        FhirConsentDto result = fhirService.createConsent(patientId, consent);
        return ResponseEntity.ok(result);
    }

    /**
     * Submit eCheck-in data for an appointment.
     * POST /api/appointments/{id}/echeckin/submit
     * Validates completeness, marks appointment PRECHECKIN_COMPLETE.
     */
    @PostMapping("/appointments/{id}/echeckin/submit")
    public ResponseEntity<Map<String, Object>> submitEcheckin(
            @PathVariable Long id,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("eCheck-in final submit for appointmentId: {}, patientId: {}", id, patientId);

        try {
            Map<String, Object> result = echeckinService.finalSubmitEcheckin(patientId, id);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error submitting eCheck-in: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to submit eCheck-in: " + e.getMessage(), e);
        }
    }

    /**
     * Get eCheck-in status for an appointment.
     * GET /api/patient-portal/echeckin/status/{appointmentId}
     * @deprecated Use GET /api/appointments/{id}/echeckin instead
     */
    @GetMapping("/patient-portal/echeckin/status/{appointmentId}")
    public ResponseEntity<Map<String, Object>> getEcheckinStatus(
            @PathVariable Long appointmentId,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.debug("Checking eCheck-in status for appointmentId: {}, patientId: {}", 
                appointmentId, patientId);

        try {
            String status = echeckinService.getEcheckinStatus(patientId, appointmentId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("appointmentId", appointmentId);
            response.put("status", status); // PENDING, PRECHECKIN_COMPLETE, COMPLETE
            response.put("canStartEcheckin", "PENDING".equals(status));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking eCheck-in status: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to check eCheck-in status: " + e.getMessage(), e);
        }
    }
}

