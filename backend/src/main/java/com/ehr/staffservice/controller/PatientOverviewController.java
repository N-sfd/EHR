package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientOverviewDto;
import com.ehr.staffservice.service.PatientOverviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/patient-overview")
@RequiredArgsConstructor
public class PatientOverviewController {

    private final PatientOverviewService service;

    /**
     * Get comprehensive patient overview similar to Epic's Summary/Overview page
     * Includes: Patient info, Vital Signs, Work List Tasks, Treatment Team, 
     * Care Plans, Allergies, Recent Notes, and Upcoming Appointments
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PatientOverviewDto> getPatientOverview(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getPatientOverview(patientId));
    }

    /**
     * Get patient overview with date range for vital signs and notes
     */
    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<PatientOverviewDto> getPatientOverviewWithDateRange(
            @PathVariable Long patientId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate) {
        return ResponseEntity.ok(service.getPatientOverviewWithDateRange(patientId, startDate, endDate));
    }
}

