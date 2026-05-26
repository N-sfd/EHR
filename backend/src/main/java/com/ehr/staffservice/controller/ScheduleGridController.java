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

    @GetMapping("/doctor/{doctorId}/date/{date}")
    public ResponseEntity<ScheduleGridDto> getDoctorScheduleGrid(
            @PathVariable Long doctorId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getDoctorScheduleGrid(doctorId, date));
    }

    @GetMapping("/doctor/{doctorId}/range")
    public ResponseEntity<List<ScheduleGridDto>> getDoctorScheduleGridRange(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.getDoctorScheduleGridRange(doctorId, startDate, endDate));
    }

    @GetMapping("/doctors/date/{date}")
    public ResponseEntity<List<ScheduleGridDto>> getMultiDoctorScheduleGrid(
            @RequestParam List<Long> doctorIds,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(service.getMultiDoctorScheduleGrid(doctorIds, date));
    }
}

