package com.ehr.staffservice.controller.scheduling;

import com.ehr.staffservice.dto.scheduling.ProviderDto;
import com.ehr.staffservice.dto.scheduling.DepartmentDto;
import com.ehr.staffservice.dto.scheduling.ScheduleTemplateDto;
import com.ehr.staffservice.dto.scheduling.AppointmentRequestDto;
import com.ehr.staffservice.dto.scheduling.AppointmentResponseDto;
import com.ehr.staffservice.response.ApiResponse;
import com.ehr.staffservice.service.scheduling.ProviderService;
import com.ehr.staffservice.service.scheduling.DepartmentService;
import com.ehr.staffservice.service.scheduling.ScheduleTemplateService;
import com.ehr.staffservice.service.scheduling.AppointmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class SchedulingController {
    private final ProviderService providerService;
    private final DepartmentService departmentService;
    private final ScheduleTemplateService scheduleTemplateService;
    private final AppointmentService appointmentService;

    @GetMapping("/providers")
    public ResponseEntity<ApiResponse> getProviders() {
        List<ProviderDto> providers = providerService.getActiveProviders();
        return ResponseEntity.ok(ApiResponse.ok(providers, "Providers retrieved successfully"));
    }

    @GetMapping("/departments")
    public ResponseEntity<ApiResponse> getDepartments() {
        List<DepartmentDto> departments = departmentService.getActiveDepartments();
        return ResponseEntity.ok(ApiResponse.ok(departments, "Departments retrieved successfully"));
    }

    @GetMapping("/schedule-templates")
    public ResponseEntity<ApiResponse> getScheduleTemplates(
            @RequestParam(required = false) Long providerId) {
        List<ScheduleTemplateDto> templates;
        if (providerId != null) {
            templates = scheduleTemplateService.getTemplatesByProviderId(providerId);
        } else {
            templates = List.of();
        }
        return ResponseEntity.ok(ApiResponse.ok(templates, "Schedule templates retrieved successfully"));
    }

    @PostMapping("/schedule-templates")
    public ResponseEntity<ApiResponse> createScheduleTemplate(
            @Valid @RequestBody ScheduleTemplateDto dto) {
        ScheduleTemplateDto created = scheduleTemplateService.createTemplate(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Schedule template created successfully"));
    }

    @GetMapping("/appointments")
    public ResponseEntity<ApiResponse> getAppointments(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) Long providerId) {
        List<AppointmentResponseDto> appointments;
        if (providerId != null) {
            appointments = appointmentService.getAppointmentsByDateAndProvider(date, providerId);
        } else {
            appointments = appointmentService.getAppointmentsByDate(date);
        }
        return ResponseEntity.ok(ApiResponse.ok(appointments, "Appointments retrieved successfully"));
    }

    @PostMapping("/appointments")
    public ResponseEntity<ApiResponse> createAppointment(
            @Valid @RequestBody AppointmentRequestDto dto) {
        AppointmentResponseDto created = appointmentService.createAppointment(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Appointment created successfully"));
    }

    @PutMapping("/appointments/{id}/cancel")
    public ResponseEntity<ApiResponse> cancelAppointment(
            @PathVariable Long id,
            @RequestBody(required = false) String reason) {
        AppointmentResponseDto canceled = appointmentService.cancelAppointment(id, reason);
        return ResponseEntity.ok(ApiResponse.ok(canceled, "Appointment canceled successfully"));
    }
}

