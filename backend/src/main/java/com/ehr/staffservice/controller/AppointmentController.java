package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.AppointmentDto;
import com.ehr.staffservice.dto.CalendarViewDto;
import com.ehr.staffservice.dto.TimeSlotDto;
import com.ehr.staffservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
public class AppointmentController {

    private final AppointmentService service;

    @PostMapping
    public ResponseEntity<AppointmentDto> create(@RequestBody Map<String, Object> request) {
        // Convert frontend format to DTO
        AppointmentDto dto = new AppointmentDto();
        
        // Map appointmentId to appointmentCode
        if (request.get("appointmentId") != null) {
            dto.setAppointmentCode(request.get("appointmentId").toString());
        }
        
        // Map other fields
        if (request.get("patientId") != null) {
            dto.setPatientId(Long.valueOf(request.get("patientId").toString()));
        }
        if (request.get("doctorId") != null) {
            dto.setDoctorId(Long.valueOf(request.get("doctorId").toString()));
        }
        if (request.get("departmentId") != null) {
            dto.setDepartmentId(Long.valueOf(request.get("departmentId").toString()));
        }
        if (request.get("appointmentType") != null) {
            dto.setAppointmentType(request.get("appointmentType").toString());
        }
        if (request.get("date") != null) {
            dto.setAppointmentDate(LocalDate.parse(request.get("date").toString()));
        }
        if (request.get("time") != null) {
            String timeStr = request.get("time").toString();
            // Handle "HH:mm" or "HH:mm AM/PM" format
            if (timeStr.contains("AM") || timeStr.contains("PM")) {
                // Parse 12-hour format (e.g., "11:19 AM")
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("h:mm a");
                dto.setAppointmentTime(LocalTime.parse(timeStr, formatter));
            } else {
                // Parse 24-hour format (e.g., "11:19")
                dto.setAppointmentTime(LocalTime.parse(timeStr));
            }
        }
        if (request.get("reason") != null) {
            dto.setReason(request.get("reason").toString());
        }
        if (request.get("status") != null) {
            dto.setStatus(request.get("status").toString());
        }
        
        AppointmentDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<AppointmentDto> getByCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getByCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AppointmentDto> update(@PathVariable Long id,
                                                 @Valid @RequestBody AppointmentDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/doctors/{doctorId}")
    public ResponseEntity<List<AppointmentDto>> getByDoctor(@PathVariable Long doctorId) {
        return ResponseEntity.ok(service.getByDoctor(doctorId));
    }

    @GetMapping("/patients/{patientId}")
    public ResponseEntity<List<AppointmentDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatient(patientId));
    }

    @GetMapping("/departments/{departmentId}")
    public ResponseEntity<List<AppointmentDto>> getByDepartment(@PathVariable Long departmentId) {
        return ResponseEntity.ok(service.getByDepartment(departmentId));
    }

    @GetMapping("/range")
    public ResponseEntity<List<AppointmentDto>> getByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate end) {
        return ResponseEntity.ok(service.getByDateRange(start.toString(), end.toString()));
    }

    // Calendar view endpoints
    @GetMapping("/calendar/week")
    public ResponseEntity<CalendarViewDto> getWeekView(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStart,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(service.getWeekView(weekStart, doctorId));
    }

    @GetMapping("/calendar/month")
    public ResponseEntity<CalendarViewDto> getMonthView(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate monthStart,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(service.getMonthView(monthStart, doctorId));
    }

    @GetMapping("/calendar/day")
    public ResponseEntity<CalendarViewDto> getDayView(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId) {
        return ResponseEntity.ok(service.getDayView(date, doctorId));
    }

    @GetMapping("/calendar/available-slots")
    public ResponseEntity<List<TimeSlotDto>> getAvailableTimeSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId,
            @RequestParam(required = false, defaultValue = "30") Integer slotDurationMinutes) {
        return ResponseEntity.ok(service.getAvailableTimeSlots(date, doctorId, slotDurationMinutes));
    }

    @GetMapping("/calendar/check-availability")
    public ResponseEntity<Map<String, Boolean>> checkAvailability(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime startTime,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime endTime,
            @RequestParam Long doctorId) {
        Boolean available = service.isTimeSlotAvailable(date, startTime, endTime, doctorId);
        return ResponseEntity.ok(Map.of("available", available));
    }
}

