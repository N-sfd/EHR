package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ProviderEncounterDto;
import com.ehr.staffservice.service.ProviderEncounterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/provider-encounters")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProviderEncounterController {

    private final ProviderEncounterService service;

    @PostMapping
    public ResponseEntity<ProviderEncounterDto> create(@Valid @RequestBody ProviderEncounterDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProviderEncounterDto> update(@PathVariable Long id, @Valid @RequestBody ProviderEncounterDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProviderEncounterDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/encounter/{encounterId}")
    public ResponseEntity<ProviderEncounterDto> getByEncounterId(@PathVariable Long encounterId) {
        Optional<ProviderEncounterDto> dto = service.getByEncounterId(encounterId);
        return dto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/sign")
    public ResponseEntity<ProviderEncounterDto> sign(
            @PathVariable Long id,
            @RequestParam Long staffId) {
        return ResponseEntity.ok(service.sign(id, staffId));
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<ProviderEncounterDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.complete(id));
    }
}

