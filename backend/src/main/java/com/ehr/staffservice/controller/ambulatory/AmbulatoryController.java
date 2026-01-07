package com.ehr.staffservice.controller.ambulatory;

import com.ehr.staffservice.dto.ambulatory.EncounterDto;
import com.ehr.staffservice.response.ApiResponse;
import com.ehr.staffservice.service.ambulatory.EncounterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical/encounters")
@RequiredArgsConstructor
public class AmbulatoryController {
    private final EncounterService encounterService;

    @PostMapping("/from-appointment/{appointmentId}")
    public ResponseEntity<ApiResponse> createEncounterFromAppointment(
            @PathVariable Long appointmentId) {
        EncounterDto created = encounterService.createEncounterFromAppointment(appointmentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Encounter created successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getEncounterById(@PathVariable Long id) {
        EncounterDto encounter = encounterService.getEncounterById(id);
        return ResponseEntity.ok(ApiResponse.ok(encounter, "Encounter retrieved successfully"));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<ApiResponse> getEncountersByPatientId(
            @PathVariable Long patientId) {
        List<EncounterDto> encounters = encounterService.getEncountersByPatientId(patientId);
        return ResponseEntity.ok(ApiResponse.ok(encounters, "Encounters retrieved successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateEncounter(
            @PathVariable Long id,
            @Valid @RequestBody EncounterDto dto) {
        EncounterDto updated = encounterService.updateEncounter(id, dto);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Encounter updated successfully"));
    }
}

