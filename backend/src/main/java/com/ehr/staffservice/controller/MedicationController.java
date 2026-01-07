package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.MedicationDto;
import com.ehr.staffservice.service.MedicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medications")
@RequiredArgsConstructor
public class MedicationController {

    private final MedicationService service;

    @PostMapping
    public ResponseEntity<MedicationDto> create(@Valid @RequestBody MedicationDto dto) {
        MedicationDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicationDto>> getByPatient(@PathVariable Long patientId,
                                                             @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<MedicationDto>> getActiveMedications(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getActiveMedications(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicationDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicationDto> update(@PathVariable Long id, @Valid @RequestBody MedicationDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

