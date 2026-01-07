package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ServiceDto;
import com.ehr.staffservice.service.ServiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceService service;

    @PostMapping
    public ResponseEntity<ServiceDto> create(@Valid @RequestBody ServiceDto dto) {
        ServiceDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<ServiceDto>> getAll() {
        List<ServiceDto> services = service.getAll();
        return ResponseEntity.ok(services);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceDto> get(@PathVariable Long id) {
        ServiceDto serviceDto = service.get(id);
        return ResponseEntity.ok(serviceDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceDto> update(@PathVariable Long id,
                                             @Valid @RequestBody ServiceDto dto) {
        ServiceDto updated = service.update(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

