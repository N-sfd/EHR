package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.CarePlanDto;
import com.ehr.staffservice.service.CarePlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/care-plans")
@RequiredArgsConstructor
public class CarePlanController {

    private final CarePlanService service;

    @PostMapping
    public ResponseEntity<CarePlanDto> create(@Valid @RequestBody CarePlanDto dto) {
        CarePlanDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<CarePlanDto>> getByPatient(@PathVariable Long patientId,
                                                           @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CarePlanDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CarePlanDto> update(@PathVariable Long id, @Valid @RequestBody CarePlanDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<CarePlanDto> resolve(@PathVariable Long id) {
        return ResponseEntity.ok(service.resolve(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

