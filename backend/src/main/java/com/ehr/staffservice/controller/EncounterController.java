package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.EncounterDto;
import com.ehr.staffservice.service.EncounterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/encounters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EncounterController {

    private final EncounterService service;

    @PostMapping
    public ResponseEntity<EncounterDto> create(@Valid @RequestBody EncounterDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<EncounterDto> update(@PathVariable Long id, @Valid @RequestBody EncounterDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EncounterDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/number/{encounterNumber}")
    public ResponseEntity<EncounterDto> getByEncounterNumber(@PathVariable String encounterNumber) {
        return ResponseEntity.ok(service.getByEncounterNumber(encounterNumber));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<EncounterDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<EncounterDto>> getByPatientIdAndStatus(
            @PathVariable Long patientId,
            @PathVariable String status) {
        return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<List<EncounterDto>> getByAppointmentId(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(service.getByAppointmentId(appointmentId));
    }

    @PatchMapping("/{id}/check-in")
    public ResponseEntity<EncounterDto> checkIn(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ResponseEntity.ok(service.checkIn(id, staffId));
    }

    @PatchMapping("/{id}/check-out")
    public ResponseEntity<EncounterDto> checkOut(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ResponseEntity.ok(service.checkOut(id, staffId));
    }

    @PatchMapping("/{id}/complete-registration")
    public ResponseEntity<EncounterDto> completeRegistration(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ResponseEntity.ok(service.completeRegistration(id, staffId));
    }
}

