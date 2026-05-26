package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientEncounterDetailDto;
import com.ehr.staffservice.dto.PatientEncounterDto;
import com.ehr.staffservice.service.PatientEncounterService;
import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Patient Encounters controller for MyChart.
 * Provides encounter history and details for patients.
 */
@Slf4j
@RestController
@RequestMapping("/api/patient/encounters")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientEncounterController {

    private final PatientEncounterService encounterService;

    /**
     * GET /api/patient/encounters?from=YYYY-MM-DD&to=YYYY-MM-DD
     * Returns list of encounters for the patient within the date range.
     */
    @GetMapping
    public ResponseEntity<List<PatientEncounterDto>> getEncounters(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        
        if (session == null || session.getPatientId() == null) {
            log.warn("Encounters request without valid session");
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long patientId = session.getPatientId();
            log.debug("Getting encounters for patientId: {}, from: {}, to: {}", patientId, from, to);
            
            List<PatientEncounterDto> encounters;
            if (from != null || to != null) {
                encounters = encounterService.getEncounters(patientId, from, to);
            } else {
                encounters = encounterService.getAllEncounters(patientId);
            }
            
            return ResponseEntity.ok(encounters);
        } catch (Exception e) {
            log.error("Error getting encounters: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get encounters: " + e.getMessage(), e);
        }
    }

    /**
     * GET /api/patient/encounters/{id}
     * Returns detailed encounter information.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PatientEncounterDetailDto> getEncounterDetail(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session,
            @PathVariable Long id) {
        
        if (session == null || session.getPatientId() == null) {
            log.warn("Encounter detail request without valid session");
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }

        try {
            Long patientId = session.getPatientId();
            log.debug("Getting encounter detail for patientId: {}, encounterId: {}", patientId, id);
            
            PatientEncounterDetailDto encounter = encounterService.getEncounterDetail(patientId, id);
            return ResponseEntity.ok(encounter);
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.error("Encounter not found: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error getting encounter detail: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get encounter detail: " + e.getMessage(), e);
        }
    }
}

