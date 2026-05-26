package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.fhir.FhirPatientDto;
import com.ehr.staffservice.dto.fhir.FhirCoverageDto;
import com.ehr.staffservice.dto.fhir.FhirConsentDto;
import com.ehr.staffservice.service.FhirService;
import com.ehr.staffservice.service.SessionService;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FHIR R4 resource endpoints for eCheck-in wizard.
 * Supports GET, PATCH, POST, and PUT operations.
 */
@Slf4j
@RestController
@RequestMapping("/fhir")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class FhirController {

    private final FhirService fhirService;

    /**
     * GET /fhir/Patient/{id}
     * Get Patient resource by ID.
     */
    @GetMapping("/Patient/{id}")
    public ResponseEntity<FhirPatientDto> getPatient(
            @PathVariable String id,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = extractPatientId(id);
        if (!patientId.equals(session.getPatientId())) {
            throw new ResourceNotFoundException("Patient ID mismatch.");
        }

        log.info("GET /fhir/Patient/{} for patientId: {}", id, patientId);
        FhirPatientDto patient = fhirService.getPatient(patientId);
        return ResponseEntity.ok(patient);
    }

    /**
     * PATCH /fhir/Patient/{id}
     * Partial update of Patient resource (demographics/contact).
     */
    @PatchMapping("/Patient/{id}")
    public ResponseEntity<FhirPatientDto> patchPatient(
            @PathVariable String id,
            @Valid @RequestBody FhirPatientDto patient,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        // Extract patient ID from FHIR ID (e.g., "patient1" -> 1)
        Long patientId = extractPatientId(id);
        if (!patientId.equals(session.getPatientId())) {
            throw new ResourceNotFoundException("Patient ID mismatch.");
        }

        log.info("PATCH /fhir/Patient/{} for patientId: {}", id, patientId);
        FhirPatientDto updated = fhirService.updatePatient(patientId, patient);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /fhir/Coverage
     * Get Coverage resources with optional filters.
     * Query params: beneficiary=Patient/{id}, status=active
     */
    @GetMapping("/Coverage")
    public ResponseEntity<List<FhirCoverageDto>> getCoverages(
            @RequestParam(required = false) String beneficiary,
            @RequestParam(required = false) String status,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("GET /fhir/Coverage for patientId: {}, beneficiary: {}, status: {}", patientId, beneficiary, status);
        
        List<FhirCoverageDto> coverages = fhirService.getCoverages(patientId, status);
        return ResponseEntity.ok(coverages);
    }

    /**
     * POST /fhir/Coverage
     * Create or update Coverage resource (insurance).
     */
    @PostMapping("/Coverage")
    public ResponseEntity<FhirCoverageDto> createOrUpdateCoverage(
            @Valid @RequestBody FhirCoverageDto coverage,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("POST /fhir/Coverage for patientId: {}", patientId);
        
        FhirCoverageDto result = fhirService.upsertCoverage(patientId, coverage);
        return ResponseEntity.ok(result);
    }

    /**
     * PUT /fhir/Coverage/{id}
     * Update existing Coverage resource.
     */
    @PutMapping("/Coverage/{id}")
    public ResponseEntity<FhirCoverageDto> updateCoverage(
            @PathVariable String id,
            @Valid @RequestBody FhirCoverageDto coverage,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("PUT /fhir/Coverage/{} for patientId: {}", id, patientId);
        
        FhirCoverageDto result = fhirService.updateCoverage(id, patientId, coverage);
        return ResponseEntity.ok(result);
    }

    /**
     * GET /fhir/Consent
     * Get Consent resources with optional filters.
     * Query params: patient=Patient/{id}, status=active
     */
    @GetMapping("/Consent")
    public ResponseEntity<List<FhirConsentDto>> getConsents(
            @RequestParam(required = false) String patient,
            @RequestParam(required = false) String status,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("GET /fhir/Consent for patientId: {}, patient: {}, status: {}", patientId, patient, status);
        
        List<FhirConsentDto> consents = fhirService.getConsents(patientId, status);
        return ResponseEntity.ok(consents);
    }

    /**
     * POST /fhir/Consent
     * Create Consent resource.
     */
    @PostMapping("/Consent")
    public ResponseEntity<FhirConsentDto> createConsent(
            @Valid @RequestBody FhirConsentDto consent,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            throw new ResourceNotFoundException("Patient ID not found in session.");
        }

        Long patientId = session.getPatientId();
        log.info("POST /fhir/Consent for patientId: {}", patientId);
        
        FhirConsentDto result = fhirService.createConsent(patientId, consent);
        return ResponseEntity.ok(result);
    }

    private Long extractPatientId(String fhirId) {
        // Extract numeric ID from FHIR ID (e.g., "patient1" -> 1, "cov1" -> 1)
        String numericPart = fhirId.replaceAll("[^0-9]", "");
        if (numericPart.isEmpty()) {
            throw new IllegalArgumentException("Invalid FHIR ID format: " + fhirId);
        }
        return Long.parseLong(numericPart);
    }
}

