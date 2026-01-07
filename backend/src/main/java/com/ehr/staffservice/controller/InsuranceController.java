package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.InsuranceDto;
import com.ehr.staffservice.service.InsuranceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/insurances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class InsuranceController {

    private final InsuranceService service;

    @PostMapping
    public ResponseEntity<InsuranceDto> create(@Valid @RequestBody InsuranceDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<InsuranceDto> update(@PathVariable Long id, @Valid @RequestBody InsuranceDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InsuranceDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<InsuranceDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<InsuranceDto>> getActiveByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getActiveByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/primary")
    public ResponseEntity<InsuranceDto> getPrimaryByPatientId(@PathVariable Long patientId) {
        Optional<InsuranceDto> dto = service.getPrimaryByPatientId(patientId);
        return dto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

