package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.MedicationAdministrationDto;
import com.ehr.staffservice.service.MedicationAdministrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medication-administrations")
@RequiredArgsConstructor
public class MedicationAdministrationController {

    private final MedicationAdministrationService service;

    @PostMapping
    public ResponseEntity<MedicationAdministrationDto> create(@Valid @RequestBody MedicationAdministrationDto dto) {
        MedicationAdministrationDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicationAdministrationDto>> getByPatient(@PathVariable Long patientId,
                                                                           @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/medication/{medicationId}")
    public ResponseEntity<List<MedicationAdministrationDto>> getByMedication(@PathVariable Long medicationId) {
        return ResponseEntity.ok(service.getByMedicationId(medicationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationAdministrationDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationAdministrationDto> update(@PathVariable Long id, @Valid @RequestBody MedicationAdministrationDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/administer")
    public ResponseEntity<MedicationAdministrationDto> administer(@PathVariable Long id, @RequestParam Long staffId) {
        return ResponseEntity.ok(service.administerMedication(id, staffId));
    }

    @PatchMapping("/{id}/hold")
    public ResponseEntity<MedicationAdministrationDto> hold(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(service.holdMedication(id, reason));
    }

    @PatchMapping("/{id}/refuse")
    public ResponseEntity<MedicationAdministrationDto> refuse(@PathVariable Long id, @RequestParam String reason) {
        return ResponseEntity.ok(service.refuseMedication(id, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

