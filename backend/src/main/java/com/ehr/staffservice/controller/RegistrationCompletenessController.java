package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.RegistrationCompletenessDto;
import com.ehr.staffservice.service.EnhancedRegistrationCompletenessService;
import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Registration Completeness controller for MyChart.
 * Provides detailed registration completeness information.
 */
@Slf4j
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class RegistrationCompletenessController {

    private final EnhancedRegistrationCompletenessService completenessService;
    private final com.ehr.staffservice.repository.PatientRepository patientRepository;

    /**
     * GET /api/patients/{patientId}/registration/completeness
     * Returns detailed registration completeness for a patient.
     * Accessible by PATIENT (own record) or ADMIN/PROVIDER (any patient).
     */
    @GetMapping("/{patientId}/registration/completeness")
    @PreAuthorize("hasRole('PATIENT') or hasAnyRole('ADMIN', 'PROVIDER')")
    public ResponseEntity<RegistrationCompletenessDto> getCompleteness(
            @PathVariable Long patientId,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null) {
            log.warn("Completeness request without valid session");
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        // PATIENT role can only access their own record
        if ("PATIENT".equals(session.getRole()) && 
            (session.getPatientId() == null || !session.getPatientId().equals(patientId))) {
            log.warn("Patient {} attempted to access completeness for patient {}", 
                    session.getPatientId(), patientId);
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        try {
            com.ehr.staffservice.entity.Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new com.ehr.staffservice.exception.ResourceNotFoundException(
                            "Patient not found with ID: " + patientId));

            RegistrationCompletenessDto completeness = completenessService.computeCompleteness(patient);
            return ResponseEntity.ok(completeness);
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.error("Patient not found for completeness: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error getting registration completeness: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get registration completeness: " + e.getMessage(), e);
        }
    }
}

