package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.FlowsheetDto;
import com.ehr.staffservice.service.FlowsheetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/flowsheets")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FlowsheetController {

    private final FlowsheetService service;

    @PostMapping
    public ResponseEntity<FlowsheetDto> create(@Valid @RequestBody FlowsheetDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlowsheetDto> update(@PathVariable Long id, @Valid @RequestBody FlowsheetDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FlowsheetDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<FlowsheetDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/type/{flowsheetType}")
    public ResponseEntity<List<FlowsheetDto>> getByPatientIdAndFlowsheetType(
            @PathVariable Long patientId,
            @PathVariable String flowsheetType) {
        return ResponseEntity.ok(service.getByPatientIdAndFlowsheetType(patientId, flowsheetType));
    }

    @GetMapping("/patient/{patientId}/date-range")
    public ResponseEntity<List<FlowsheetDto>> getByPatientIdAndDateRange(
            @PathVariable Long patientId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        return ResponseEntity.ok(service.getByPatientIdAndDateRange(patientId, startDate, endDate));
    }
}

