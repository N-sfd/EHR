package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.VitalSignDto;
import com.ehr.staffservice.service.VitalSignService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/vital-signs")
@RequiredArgsConstructor
public class VitalSignController {

    private final VitalSignService service;

    @PostMapping
    public ResponseEntity<VitalSignDto> create(@Valid @RequestBody VitalSignDto dto) {
        VitalSignDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<VitalSignDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/latest")
    public ResponseEntity<VitalSignDto> getLatestByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getLatestByPatientId(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VitalSignDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VitalSignDto> update(@PathVariable Long id, @Valid @RequestBody VitalSignDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

