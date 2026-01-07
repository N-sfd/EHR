package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.TreatmentTeamDto;
import com.ehr.staffservice.service.TreatmentTeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/treatment-teams")
@RequiredArgsConstructor
public class TreatmentTeamController {

    private final TreatmentTeamService service;

    @PostMapping
    public ResponseEntity<TreatmentTeamDto> create(@Valid @RequestBody TreatmentTeamDto dto) {
        TreatmentTeamDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TreatmentTeamDto>> getByPatient(@PathVariable Long patientId,
                                                                @RequestParam(required = false, defaultValue = "ACTIVE") String status) {
        return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<TreatmentTeamDto>> getByStaff(@PathVariable Long staffId,
                                                               @RequestParam(required = false, defaultValue = "ACTIVE") String status) {
        return ResponseEntity.ok(service.getByStaffIdAndStatus(staffId, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TreatmentTeamDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TreatmentTeamDto> update(@PathVariable Long id, @Valid @RequestBody TreatmentTeamDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

