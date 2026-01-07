package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ClinicSettingsDto;
import com.ehr.staffservice.service.ClinicSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/clinic-settings")
@RequiredArgsConstructor
public class ClinicSettingsController {

    private final ClinicSettingsService service;

    @GetMapping
    public ResponseEntity<ClinicSettingsDto> get() {
        ClinicSettingsDto settings = service.get();
        if (settings == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(settings);
    }

    @PostMapping
    public ResponseEntity<ClinicSettingsDto> create(@Valid @RequestBody ClinicSettingsDto dto) {
        try {
            ClinicSettingsDto created = service.create(dto);
            return ResponseEntity.ok(created);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClinicSettingsDto> update(@PathVariable Long id,
                                                    @Valid @RequestBody ClinicSettingsDto dto) {
        try {
            ClinicSettingsDto updated = service.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}

