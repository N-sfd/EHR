package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.reports.ProviderUtilizationDto;
import com.ehr.staffservice.dto.reports.SchedulingSummaryDto;
import com.ehr.staffservice.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Reports Controller
 * Lightweight reporting endpoints for scheduling analytics
 */
@RestController
@RequestMapping("/api/reports/scheduling")
@RequiredArgsConstructor
public class ReportsController {

    private final AppointmentService appointmentService;

    /**
     * Get scheduling summary report
     * GET /api/reports/scheduling/summary?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorIds=1,2,3
     */
    @GetMapping("/summary")
    public ResponseEntity<SchedulingSummaryDto> getSchedulingSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) List<Long> doctorIds) {
        
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();
        
        SchedulingSummaryDto summary = appointmentService.getSchedulingSummary(
                startDateTime, endDateTime, doctorIds);
        
        return ResponseEntity.ok(summary);
    }

    /**
     * Get provider utilization report
     * GET /api/reports/scheduling/provider-utilization?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorIds=1,2,3
     */
    @GetMapping("/provider-utilization")
    public ResponseEntity<List<ProviderUtilizationDto>> getProviderUtilization(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) List<Long> doctorIds) {
        
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();
        
        List<ProviderUtilizationDto> utilization = appointmentService.getProviderUtilization(
                startDateTime, endDateTime, doctorIds);
        
        return ResponseEntity.ok(utilization);
    }
}

