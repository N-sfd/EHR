package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.RoomingDto;
import com.ehr.staffservice.service.RoomingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/rooming")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomingController {

    private final RoomingService service;

    @PostMapping
    public ResponseEntity<RoomingDto> create(@Valid @RequestBody RoomingDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RoomingDto> update(@PathVariable Long id, @Valid @RequestBody RoomingDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomingDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/encounter/{encounterId}")
    public ResponseEntity<RoomingDto> getByEncounterId(@PathVariable Long encounterId) {
        Optional<RoomingDto> dto = service.getByEncounterId(encounterId);
        return dto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<RoomingDto> getByAppointmentId(@PathVariable Long appointmentId) {
        Optional<RoomingDto> dto = service.getByAppointmentId(appointmentId);
        return dto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<RoomingDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.complete(id));
    }
}

