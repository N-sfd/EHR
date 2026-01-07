package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ImagingStudyDto;
import com.ehr.staffservice.service.ImagingStudyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/imaging-studies")
@RequiredArgsConstructor
public class ImagingStudyController {

    private final ImagingStudyService service;

    @PostMapping
    public ResponseEntity<ImagingStudyDto> create(@Valid @RequestBody ImagingStudyDto dto) {
        ImagingStudyDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ImagingStudyDto>> getByPatient(@PathVariable Long patientId,
                                                               @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/type/{studyType}")
    public ResponseEntity<List<ImagingStudyDto>> getByStudyType(@PathVariable String studyType) {
        return ResponseEntity.ok(service.getByStudyType(studyType));
    }

    @GetMapping("/preliminary")
    public ResponseEntity<List<ImagingStudyDto>> getPreliminaryStudies() {
        return ResponseEntity.ok(service.getPreliminaryStudies());
    }

    @GetMapping("/number/{studyNumber}")
    public ResponseEntity<ImagingStudyDto> getByStudyNumber(@PathVariable String studyNumber) {
        return ResponseEntity.ok(service.getByStudyNumber(studyNumber));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImagingStudyDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ImagingStudyDto> update(@PathVariable Long id, @Valid @RequestBody ImagingStudyDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ImagingStudyDto> completeStudy(@PathVariable Long id,
                                                          @RequestParam Long staffId,
                                                          @RequestParam String findings,
                                                          @RequestParam String impression) {
        return ResponseEntity.ok(service.completeStudy(id, staffId, findings, impression));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

