package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ImmunizationDto;
import com.ehr.staffservice.service.ImmunizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/immunizations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ImmunizationController {

    private final ImmunizationService service;

    @PostMapping
    public ResponseEntity<ImmunizationDto> create(@Valid @RequestBody ImmunizationDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImmunizationDto> update(@PathVariable Long id, @Valid @RequestBody ImmunizationDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImmunizationDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ImmunizationDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<ImmunizationDto>> getByPatientIdAndStatus(
            @PathVariable Long patientId,
            @PathVariable String status) {
        return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
    }

    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<ImmunizationDto>> getByPatientIdAndDateRange(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.getByPatientIdAndDateRange(patientId, startDate, endDate));
    }

    @GetMapping("/patient/{patientId}/vaccine/{vaccineName}")
    public ResponseEntity<List<ImmunizationDto>> getByPatientIdAndVaccineName(
            @PathVariable Long patientId,
            @PathVariable String vaccineName) {
        return ResponseEntity.ok(service.getByPatientIdAndVaccineName(patientId, vaccineName));
    }
}

