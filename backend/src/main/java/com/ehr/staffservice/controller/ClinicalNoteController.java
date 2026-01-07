package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ClinicalNoteDto;
import com.ehr.staffservice.service.ClinicalNoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/clinical-notes")
@RequiredArgsConstructor
public class ClinicalNoteController {

    private final ClinicalNoteService service;

    @PostMapping
    public ResponseEntity<ClinicalNoteDto> create(@Valid @RequestBody ClinicalNoteDto dto) {
        ClinicalNoteDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ClinicalNoteDto>> getByPatient(@PathVariable Long patientId,
                                                                @RequestParam(required = false) String noteType) {
        if (noteType != null) {
            return ResponseEntity.ok(service.getByPatientIdAndNoteType(patientId, noteType));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<ClinicalNoteDto>> getByStaff(@PathVariable Long staffId) {
        return ResponseEntity.ok(service.getByStaffId(staffId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClinicalNoteDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClinicalNoteDto> update(@PathVariable Long id, @Valid @RequestBody ClinicalNoteDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/sign")
    public ResponseEntity<ClinicalNoteDto> signNote(@PathVariable Long id) {
        return ResponseEntity.ok(service.signNote(id));
    }

    @PatchMapping("/{id}/cosign")
    public ResponseEntity<ClinicalNoteDto> cosignNote(@PathVariable Long id, @RequestParam Long cosignerStaffId) {
        return ResponseEntity.ok(service.cosignNote(id, cosignerStaffId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

