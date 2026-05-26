package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientProfileDto;
import com.ehr.staffservice.service.PatientProfileService;
import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Patient Profile controller for MyChart.
 * Provides patient profile data including demographics, PCP, coverage, and registration status.
 */
@Slf4j
@RestController
@RequestMapping("/api/patient/profile")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientProfileController {

    private final PatientProfileService patientProfileService;

    /**
     * GET /api/patient/profile
     * Returns patient profile data for MyChart Profile page.
     */
    @GetMapping
    public ResponseEntity<PatientProfileDto> getProfile(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            log.warn("Profile request without valid session");
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long patientId = session.getPatientId();
            log.debug("Getting profile for patientId: {}", patientId);
            
            PatientProfileDto profile = patientProfileService.getPatientProfile(patientId);
            return ResponseEntity.ok(profile);
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.error("Patient not found for profile: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error getting patient profile: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get patient profile: " + e.getMessage(), e);
        }
    }
}

