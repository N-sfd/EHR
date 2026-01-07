package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.WorkListTaskDto;
import com.ehr.staffservice.service.WorkListTaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/work-list-tasks")
@RequiredArgsConstructor
public class WorkListTaskController {

    private final WorkListTaskService service;

    @PostMapping
    public ResponseEntity<WorkListTaskDto> create(@Valid @RequestBody WorkListTaskDto dto) {
        WorkListTaskDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<WorkListTaskDto>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<WorkListTaskDto>> getByStaff(@PathVariable Long staffId,
                                                            @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByStaffIdAndStatus(staffId, status));
        }
        return ResponseEntity.ok(service.getByStaffId(staffId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<WorkListTaskDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkListTaskDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WorkListTaskDto> update(@PathVariable Long id, @Valid @RequestBody WorkListTaskDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<WorkListTaskDto> completeTask(@PathVariable Long id) {
        return ResponseEntity.ok(service.completeTask(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

