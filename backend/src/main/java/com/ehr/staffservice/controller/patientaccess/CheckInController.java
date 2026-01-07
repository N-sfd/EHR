package com.ehr.staffservice.controller.patientaccess;

import com.ehr.staffservice.dto.scheduling.AppointmentResponseDto;
import com.ehr.staffservice.response.ApiResponse;
import com.ehr.staffservice.service.scheduling.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/checkin")
@RequiredArgsConstructor
public class CheckInController {
    private final AppointmentService appointmentService;

    @PutMapping("/appointment/{id}/arrive")
    public ResponseEntity<ApiResponse> markArrived(@PathVariable Long id) {
        AppointmentResponseDto updated = appointmentService.updateAppointmentStatus(id, "ARRIVED");
        return ResponseEntity.ok(ApiResponse.ok(updated, "Patient marked as arrived"));
    }

    @PutMapping("/appointment/{id}/checkin")
    public ResponseEntity<ApiResponse> checkIn(
            @PathVariable Long id,
            @RequestBody(required = false) CheckInRequest request) {
        
        // Validate registration rules
        List<String> errors = validateCheckInRules(id);
        
        if (!errors.isEmpty()) {
            CheckInResult result = new CheckInResult();
            result.success = false;
            result.errors = errors;
            return ResponseEntity.badRequest()
                    .body(ApiResponse.ok(result, "Check-in validation failed"));
        }

        // Update appointment status to CHECKED_IN
        AppointmentResponseDto updated = appointmentService.updateAppointmentStatus(id, "CHECKED_IN");
        
        CheckInResult result = new CheckInResult();
        result.success = true;
        result.appointment = updated;
        result.errors = new ArrayList<>();
        
        return ResponseEntity.ok(ApiResponse.ok(result, "Patient checked in successfully"));
    }

    private List<String> validateCheckInRules(Long appointmentId) {
        List<String> errors = new ArrayList<>();
        
        // In real implementation, fetch appointment and patient
        // Then check registration rules from admin module
        // For now, return empty list (all valid)
        
        return errors;
    }

    public static class CheckInRequest {
        public String notes;
    }

    public static class CheckInResult {
        public boolean success;
        public AppointmentResponseDto appointment;
        public List<String> errors = new ArrayList<>();
    }
}

