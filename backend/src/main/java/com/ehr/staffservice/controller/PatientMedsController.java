package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.MedicationDto;
import com.ehr.staffservice.dto.RefillRequestDto;
import com.ehr.staffservice.dto.CreateRefillRequestDto;
import com.ehr.staffservice.service.MedicationService;
import com.ehr.staffservice.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for patient medications and refill requests.
 * All endpoints require PATIENT role and use patientId from session.
 */
@RestController
@RequestMapping("/api/meds")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientMedsController {

    private final MedicationService medicationService;

    /**
     * Get all medications for the current patient (active and inactive).
     * GET /api/meds
     */
    @GetMapping
    public ResponseEntity<List<MedicationDto>> getMedications(
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<MedicationDto> medications = medicationService.getMedicationsForPatient(patientId);
        return ResponseEntity.ok(medications);
    }

    /**
     * Create a refill request for a medication.
     * POST /api/meds/refill-requests
     */
    @PostMapping("/refill-requests")
    public ResponseEntity<RefillRequestDto> createRefillRequest(
            @Valid @RequestBody CreateRefillRequestDto request,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            RefillRequestDto refillRequest = medicationService.createRefillRequest(patientId, request);
            return ResponseEntity.status(HttpStatus.CREATED).body(refillRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create a refill request for a medication by medication ID.
     * POST /api/meds/{medId}/refill-request
     */
    @PostMapping("/{medId}/refill-request")
    public ResponseEntity<RefillRequestDto> createRefillRequestByMedId(
            @PathVariable Long medId,
            @RequestParam(required = false) String notes,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            RefillRequestDto refillRequest = medicationService.createRefillRequestByMedId(patientId, medId, notes);
            return ResponseEntity.status(HttpStatus.CREATED).body(refillRequest);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get all refill requests for the current patient.
     * GET /api/meds/refill-requests
     */
    @GetMapping("/refill-requests")
    public ResponseEntity<List<RefillRequestDto>> getRefillRequests(
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<RefillRequestDto> requests = medicationService.getRefillRequestsForPatient(patientId);
        return ResponseEntity.ok(requests);
    }
}

