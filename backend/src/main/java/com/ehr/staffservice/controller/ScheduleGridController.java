package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ScheduleGridDto;
import com.ehr.staffservice.service.ScheduleGridService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/schedule-grid")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ScheduleGridController {

    private final ScheduleGridService service;

    @GetMapping("/provider/{providerId}/date/{date}")
    public ResponseEntity<ScheduleGridDto> getProviderScheduleGrid(
            @PathVariable Long providerId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getProviderScheduleGrid(providerId, date));
    }

    @GetMapping("/provider/{providerId}/range")
    public ResponseEntity<List<ScheduleGridDto>> getProviderScheduleGridRange(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.getProviderScheduleGridRange(providerId, startDate, endDate));
    }

    @GetMapping("/providers/date/{date}")
    public ResponseEntity<List<ScheduleGridDto>> getMultiProviderScheduleGrid(
            @RequestParam List<Long> providerIds,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getMultiProviderScheduleGrid(providerIds, date));
    }
}

