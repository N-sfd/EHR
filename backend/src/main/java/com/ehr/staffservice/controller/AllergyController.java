package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.AllergyDto;
import com.ehr.staffservice.service.AllergyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/allergies")
@RequiredArgsConstructor
public class AllergyController {

    private final AllergyService service;

    @PostMapping
    public ResponseEntity<AllergyDto> create(@Valid @RequestBody AllergyDto dto) {
        AllergyDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<AllergyDto>> getByPatient(@PathVariable Long patientId,
                                                          @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AllergyDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AllergyDto> update(@PathVariable Long id, @Valid @RequestBody AllergyDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

