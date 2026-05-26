package com.ehr.staffservice.controller.scheduling;

import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.dto.scheduling.DepartmentDto;
import com.ehr.staffservice.dto.AppointmentDto;
import com.ehr.staffservice.response.ApiResponse;
import com.ehr.staffservice.service.DoctorService;
import com.ehr.staffservice.service.scheduling.DepartmentService;
import com.ehr.staffservice.service.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/scheduling")
@RequiredArgsConstructor
public class SchedulingController {
    private final DoctorService doctorService;
    private final DepartmentService departmentService;
    private final AppointmentService appointmentService;

    @GetMapping("/doctors")
    public ResponseEntity<ApiResponse> getDoctors() {
        List<DoctorDto> doctors = doctorService.getAll();
        return ResponseEntity.ok(ApiResponse.ok(doctors, "Doctors retrieved successfully"));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse> getDepartments() {
        List<DepartmentDto> departments = departmentService.getActiveDepartments();
        return ResponseEntity.ok(ApiResponse.ok(departments, "Departments retrieved successfully"));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse> getAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long doctorId) {
        LocalDateTime startDateTime = date.atStartOfDay();
        LocalDateTime endDateTime = date.plusDays(1).atStartOfDay();
        List<Long> doctorIds = doctorId != null ? List.of(doctorId) : null;
        List<AppointmentDto> appointments = appointmentService.queryAppointments(
                startDateTime, endDateTime, doctorIds, null, null, null);
        return ResponseEntity.ok(ApiResponse.ok(appointments, "Appointments retrieved successfully"));
    }

    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse> createAppointment(
            @Valid @RequestBody AppointmentDto dto) {
        AppointmentDto created = appointmentService.createAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Appointment created successfully"));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        AppointmentDto existing = appointmentService.getAppointment(id);
        existing.setStatus("CANCELLED");
        String reason = request != null ? request.get("reason") : null;
        if (reason != null && !reason.isEmpty()) {
            existing.setNotes((existing.getNotes() != null ? existing.getNotes() + "\n" : "") + 
                    "Cancellation reason: " + reason);
        }
        AppointmentDto canceled = appointmentService.updateAppointment(id, existing);
        return ResponseEntity.ok(ApiResponse.ok(canceled, "Appointment canceled successfully"));
    }
}

