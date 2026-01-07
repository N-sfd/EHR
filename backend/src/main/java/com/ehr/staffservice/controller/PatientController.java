package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientDto;
import com.ehr.staffservice.service.PatientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService service;

    @PostMapping
    public ResponseEntity<PatientDto> create(@Valid @RequestBody PatientDto dto) {
        PatientDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PatientDto> getByPatientCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getByPatientCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> update(@PathVariable Long id,
                                            @Valid @RequestBody PatientDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

