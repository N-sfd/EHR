package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.CheckoutDto;
import com.ehr.staffservice.service.CheckoutService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/checkouts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CheckoutController {

    private final CheckoutService service;

    @PostMapping
    public ResponseEntity<CheckoutDto> create(@Valid @RequestBody CheckoutDto dto) {
        return new ResponseEntity<>(service.create(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CheckoutDto> update(@PathVariable Long id, @Valid @RequestBody CheckoutDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CheckoutDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/encounter/{encounterId}")
    public ResponseEntity<CheckoutDto> getByEncounterId(@PathVariable Long encounterId) {
        Optional<CheckoutDto> dto = service.getByEncounterId(encounterId);
        return dto.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/complete")
    public ResponseEntity<CheckoutDto> complete(@PathVariable Long id) {
        return ResponseEntity.ok(service.complete(id));
    }
}

