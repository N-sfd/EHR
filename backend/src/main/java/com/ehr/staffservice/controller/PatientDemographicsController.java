package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientDemographicsDto;
import com.ehr.staffservice.service.PatientDemographicsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/patient-demographics")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PatientDemographicsController {

    private final PatientDemographicsService service;

    @PostMapping
    public ResponseEntity<PatientDemographicsDto> createOrUpdate(@Valid @RequestBody PatientDemographicsDto dto) {
        return new ResponseEntity<>(service.createOrUpdate(dto), HttpStatus.CREATED);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PatientDemographicsDto> getByPatientId(@PathVariable Long patientId) {
        Optional<PatientDemographicsDto> dto = service.getByPatientId(patientId);
        return dto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDemographicsDto> update(@PathVariable Long id, @Valid @RequestBody PatientDemographicsDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

