package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientDto;
import com.ehr.staffservice.service.PatientService;
import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Patient self-service endpoints.
 * Requires PATIENT role and uses session patientId (not URL parameter).
 */
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientSelfController {

    private final PatientService patientService;

    /**
     * GET /api/patients/me
     * Returns current patient's information (requires PATIENT role).
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<PatientDto> getMyPatientInfo(@RequestAttribute("sessionData") SessionService.SessionData session) {
        if (session.getPatientId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        PatientDto patient = patientService.get(session.getPatientId());
        return ResponseEntity.ok(patient);
    }
}

