package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Appointment Controller (Refactored)
 * 
 * ScheduleGrid endpoints:
 * - GET /appointments?start&end&providerIds (lightweight blocks)
 * - PATCH /appointments/{id}/move (drag/drop)
 * - PATCH /appointments/{id}/resize (duration change)
 * 
 * Scheduler endpoints:
 * - POST /appointments (create)
 * - PUT /appointments/{id} (update)
 * - GET /appointments/{id} (get details)
 */
@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    // ============================================================================
    // HELPER METHODS
    // ============================================================================

    /**
     * Safely parse comma-separated IDs string to List<Long>
     * Prevents crashes from empty or malformed list parameters.
     * 
     * Behavior:
     * - null/blank => null (no filter applied)
     * - "1,2,3" => [1, 2, 3] (valid IDs)
     * - "1,,2" => [1, 2] (ignores empty tokens)
     * - "abc,def" => [] (invalid numbers are skipped, returns empty list)
     * - ",,," => null (all tokens empty, treated as no filter)
     * 
     * @param idsString Comma-separated string of IDs (e.g., "1,2,3" or null)
     * @return List of Long IDs, null if input is null/blank/only empty tokens, or empty list if all tokens invalid
     */
    private List<Long> parseIds(String idsString) {
        if (!StringUtils.hasText(idsString)) {
            return null;
        }
        
        List<Long> parsed = Arrays.stream(idsString.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText) // Ignore empty tokens (e.g., "1,,2" -> ["1", "2"])
                .map(idStr -> {
                    try {
                        return Long.parseLong(idStr);
                    } catch (NumberFormatException e) {
                        // Skip invalid numbers (e.g., "abc", "1.5") - don't crash
                        return null;
                    }
                })
                .filter(id -> id != null) // Remove nulls from invalid numbers
                .collect(Collectors.toList());
        
        // If all tokens were invalid or empty, return null (treat as no filter)
        // This ensures empty list params never crash the service layer
        return parsed.isEmpty() ? null : parsed;
    }

    // ============================================================================
    // SCHEDULE GRID ENDPOINTS (Read/Interactive operations)
    // ============================================================================

    /**
     * Query appointments for grid (lightweight blocks)
     * GET /api/appointments?start=2026-01-05&end=2026-01-12&doctorIds=1,2,3&roomIds=1,2
     * Used by: ScheduleGridComponent
     */
    @GetMapping
    public ResponseEntity<List<AppointmentDto>> queryAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String doctorIds,
            @RequestParam(required = false) String departmentIds,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) String roomIds) {
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();
        
        // Parse comma-separated ID strings safely
        List<Long> parsedDoctorIds = parseIds(doctorIds);
        List<Long> parsedDepartmentIds = parseIds(departmentIds);
        List<Long> parsedRoomIds = parseIds(roomIds);
        
        List<AppointmentDto> appointments = service.queryAppointments(
                startDateTime, endDateTime, 
                parsedDoctorIds, parsedDepartmentIds, statuses, parsedRoomIds);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Query appointments by date range (alternative endpoint for Angular compatibility)
     * GET /api/appointments/range?start=YYYY-MM-DD&end=YYYY-MM-DD&doctorIds=1,2&roomIds=1,2
     * Used by: AppointmentService.getByDateRange()
     */
    @GetMapping("/range")
    public ResponseEntity<List<AppointmentDto>> getAppointmentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end,
            @RequestParam(required = false) String doctorIds,
            @RequestParam(required = false) String departmentIds,
            @RequestParam(required = false) List<String> statuses,
            @RequestParam(required = false) String roomIds) {
        LocalDateTime startDateTime = start.atStartOfDay();
        LocalDateTime endDateTime = end.plusDays(1).atStartOfDay();
        
        // Parse comma-separated ID strings safely
        List<Long> parsedDoctorIds = parseIds(doctorIds);
        List<Long> parsedDepartmentIds = parseIds(departmentIds);
        List<Long> parsedRoomIds = parseIds(roomIds);
        
        List<AppointmentDto> appointments = service.queryAppointments(
                startDateTime, endDateTime, 
                parsedDoctorIds, parsedDepartmentIds, statuses, parsedRoomIds);
        return ResponseEntity.ok(appointments);
    }

    /**
     * Move appointment (drag/drop)
     * PATCH /api/appointments/{id}/move
     * PUT /api/appointments/{id}/move (alternative for Angular compatibility)
     * Used by: ScheduleGridComponent
     */
    @PatchMapping("/{id}/move")
    @PutMapping("/{id}/move")
    public ResponseEntity<AppointmentDto> moveAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentMoveRequest request) {
        try {
            AppointmentDto updated = service.moveAppointment(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            // Conflict detected
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .header("X-Conflict-Reason", e.getMessage())
                    .build();
        }
    }

    /**
     * Resize appointment (duration change)
     * PATCH /api/appointments/{id}/resize
     * PUT /api/appointments/{id}/resize (alternative for Angular compatibility)
     * Used by: ScheduleGridComponent
     */
    @PatchMapping("/{id}/resize")
    @PutMapping("/{id}/resize")
    public ResponseEntity<AppointmentDto> resizeAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentResizeRequest request) {
        try {
            AppointmentDto updated = service.resizeAppointment(id, request);
            return ResponseEntity.ok(updated);
        } catch (IllegalStateException e) {
            // Conflict detected
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .header("X-Conflict-Reason", e.getMessage())
                    .build();
        }
    }

    /**
     * Update appointment status (Epic-style: cancel, no-show, check-in)
     * PATCH /api/appointments/{id}/status
     * Used by: ScheduleGridComponent (appointment detail panel)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        try {
            AppointmentDto updated = service.updateAppointmentStatus(id, request.getStatus(), request.getReason());
            return ResponseEntity.ok(updated);
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            // Optimistic locking conflict or other state error
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .header("X-Conflict-Reason", e.getMessage())
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ============================================================================
    // SCHEDULER ENDPOINTS (Form/Booking operations)
    // ============================================================================

    /**
     * Create appointment
     * POST /api/appointments
     * Used by: SchedulerComponent
     */
    @PostMapping
    public ResponseEntity<AppointmentDto> createAppointment(
            @Valid @RequestBody AppointmentDto request) {
        AppointmentDto created = service.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Update appointment (full update)
     * PUT /api/appointments/{id}
     * Used by: SchedulerComponent
     */
    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDto> updateAppointment(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentDto request) {
        AppointmentDto updated = service.updateAppointment(id, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Get appointment details (full)
     * GET /api/appointments/{id}
     * Used by: SchedulerComponent
     */
    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> getAppointment(@PathVariable Long id) {
        AppointmentDto appointment = service.getAppointment(id);
        return ResponseEntity.ok(appointment);
    }

    /**
     * Get current patient's appointments (requires PATIENT role)
     * GET /api/appointments/me?start=YYYY-MM-DD&end=YYYY-MM-DD
     * Uses session patientId, does NOT accept patientId in URL.
     */
    @GetMapping("/me")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<List<AppointmentDto>> getMyAppointments(
            @RequestAttribute("sessionData") com.ehr.staffservice.service.SessionService.SessionData session,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        
        if (session.getPatientId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        List<AppointmentDto> appointments = service.getByPatient(session.getPatientId());
        
        // Filter by date range if provided
        if (start != null || end != null) {
            LocalDateTime startDateTime = start != null ? start.atStartOfDay() : null;
            LocalDateTime endDateTime = end != null ? end.plusDays(1).atStartOfDay() : null;
            
            appointments = appointments.stream()
                .filter(a -> {
                    if (a.getStartDateTime() == null) return false;
                    LocalDateTime apptStart = a.getStartDateTime();
                    if (startDateTime != null && apptStart.isBefore(startDateTime)) return false;
                    if (endDateTime != null && apptStart.isAfter(endDateTime)) return false;
                    return true;
                })
                .collect(Collectors.toList());
        }
        
        return ResponseEntity.ok(appointments);
    }

    /**
     * Create appointment for current patient (requires PATIENT role)
     * POST /api/appointments/me
     * patientId MUST come from session (APP_SESSION or SMART_SESSION), not from request body.
     * Request body should contain: doctorId, startDateTime, durationMinutes, visitType, reason, etc.
     */
    @PostMapping("/me")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('PATIENT')")
    public ResponseEntity<AppointmentDto> createMyAppointment(
            @RequestAttribute("sessionData") com.ehr.staffservice.service.SessionService.SessionData session,
            @Valid @RequestBody AppointmentDto request) {
        
        if (session.getPatientId() == null) {
            return ResponseEntity.badRequest().build();
        }
        
        // Override patientId from session (security: patient cannot schedule for others)
        request.setPatientId(session.getPatientId());
        
        // Set default status if not provided
        if (request.getStatus() == null || request.getStatus().isEmpty()) {
            request.setStatus("SCHEDULED");
        }
        
        AppointmentDto created = service.createAppointment(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}

