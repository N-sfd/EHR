package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ProblemListDto;
import com.ehr.staffservice.service.ProblemListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/problem-lists")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProblemListController {

    private final ProblemListService service;

    @PostMapping
    public ResponseEntity<ProblemListDto> create(@Valid @RequestBody ProblemListDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProblemListDto> update(@PathVariable Long id, @Valid @RequestBody ProblemListDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProblemListDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ProblemListDto>> getByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<ProblemListDto>> getActiveProblemsByPatientId(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getActiveProblemsByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/status/{status}")
    public ResponseEntity<List<ProblemListDto>> getByPatientIdAndStatus(
            @PathVariable Long patientId,
            @PathVariable String status) {
        return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
    }

    @PatchMapping("/{id}/resolve")
    public ResponseEntity<ProblemListDto> resolve(
            @PathVariable Long id,
            @RequestParam Long resolvedByStaffId) {
        return ResponseEntity.ok(service.resolve(id, resolvedByStaffId));
    }
}

