package com.ehr.staffservice.controller;

import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller for patient dashboard alerts.
 * Handles alert dismissal.
 */
@Slf4j
@RestController
@RequestMapping("/api/patient/alerts")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientAlertsController {

    /**
     * Dismiss an alert.
     * POST /api/patient/alerts/{id}/dismiss
     * 
     * For now, this is a stub that just returns success.
     * In the future, this could store dismissed alerts in a database.
     */
    @PostMapping("/{id}/dismiss")
    public ResponseEntity<Map<String, String>> dismissAlert(
            @PathVariable String id,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid session"));
        }
        
        log.info("Patient {} dismissed alert: {}", patientId, id);
        
        // TODO: Store dismissed alert in database to prevent it from showing again
        // For now, just return success - frontend will handle removal from UI
        
        return ResponseEntity.ok(Map.of("success", "true", "message", "Alert dismissed"));
    }
}

