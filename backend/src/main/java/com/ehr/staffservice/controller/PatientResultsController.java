package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.LabResultDto;
import com.ehr.staffservice.service.LabResultService;
import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller for patient lab results.
 * All endpoints require PATIENT role and use patientId from session.
 */
@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientResultsController {

    private final LabResultService labResultService;

    /**
     * Get all lab results for the current patient.
     * GET /api/results/labs?from=YYYY-MM-DD&to=YYYY-MM-DD&abnormalOnly=true
     * Defaults to last 12 months if dates not provided.
     */
    @GetMapping("/labs")
    public ResponseEntity<List<LabResultDto>> getLabResults(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Boolean abnormalOnly,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<LabResultDto> results = labResultService.getLabResultsForPatient(patientId, from, to);
        
        // Filter abnormal results if requested
        if (Boolean.TRUE.equals(abnormalOnly)) {
            results = results.stream()
                    .filter(r -> r.getAbnormalCount() != null && r.getAbnormalCount() > 0)
                    .toList();
        }
        
        return ResponseEntity.ok(results);
    }

    /**
     * Get a specific lab result by ID.
     * GET /api/results/labs/{id}
     */
    @GetMapping("/labs/{id}")
    public ResponseEntity<LabResultDto> getLabResult(
            @PathVariable Long id,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            LabResultDto result = labResultService.getLabResultById(id, patientId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

