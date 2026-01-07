package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ProcedureDto;
import com.ehr.staffservice.service.ProcedureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/procedures")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProcedureController {

    private final ProcedureService service;

    @PostMapping
    public ResponseEntity<ProcedureDto> create(@Valid @RequestBody ProcedureDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProcedureDto> update(@PathVariable Long id, @Valid @RequestBody ProcedureDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProcedureDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ProcedureDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<ProcedureDto>> getByPatientIdAndStatus(
            @PathVariable Long patientId,
            @PathVariable String status) {
        return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
    }

    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<ProcedureDto>> getByPatientIdAndDateRange(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(service.getByPatientIdAndDateRange(patientId, startDate, endDate));
    }

    @GetMapping("/staff/{staffId}/date-range")
    public ResponseEntity<List<ProcedureDto>> getByPerformedByStaffIdAndDateRange(
            @PathVariable Long staffId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate) {
        return ResponseEntity.ok(service.getByPerformedByStaffIdAndDateRange(staffId, startDate));
    }
}

