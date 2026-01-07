package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.LabResultDto;
import com.ehr.staffservice.service.LabResultService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/lab-results")
@RequiredArgsConstructor
public class LabResultController {

    private final LabResultService service;

    @PostMapping
    public ResponseEntity<LabResultDto> create(@Valid @RequestBody LabResultDto dto) {
        LabResultDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabResultDto>> getByPatient(@PathVariable Long patientId,
                                                           @RequestParam(required = false) String status,
                                                           @RequestParam(required = false) String category) {
        if (category != null) {
            return ResponseEntity.ok(service.getByPatientIdAndCategory(patientId, category));
        }
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/critical")
    public ResponseEntity<List<LabResultDto>> getCriticalResults() {
        return ResponseEntity.ok(service.getCriticalResults());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabResultDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LabResultDto> update(@PathVariable Long id, @Valid @RequestBody LabResultDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/mark-notified")
    public ResponseEntity<LabResultDto> markNotified(@PathVariable Long id, @RequestParam Long staffId) {
        return ResponseEntity.ok(service.markCriticalAsNotified(id, staffId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

