package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ClinicalAlertDto;
import com.ehr.staffservice.service.ClinicalAlertService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clinical-alerts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClinicalAlertController {

    private final ClinicalAlertService service;

    @PostMapping
    public ResponseEntity<ClinicalAlertDto> create(@Valid @RequestBody ClinicalAlertDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClinicalAlertDto> update(@PathVariable Long id, @Valid @RequestBody ClinicalAlertDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalAlertDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ClinicalAlertDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<ClinicalAlertDto>> getActiveAlertsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getActiveAlertsByPatientId(patientId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<ClinicalAlertDto>> getActiveAlerts() {
        return ResponseEntity.ok(service.getActiveAlerts());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ClinicalAlertDto>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getByStatus(status));
    }

    @PatchMapping("/{id}/acknowledge")
    public ResponseEntity<ClinicalAlertDto> acknowledge(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ResponseEntity.ok(service.acknowledge(id, staffId));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ClinicalAlertDto> resolve(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ResponseEntity.ok(service.resolve(id, staffId));
    }
}

