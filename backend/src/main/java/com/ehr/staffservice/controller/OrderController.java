package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.OrderDto;
import com.ehr.staffservice.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService service;

    @PostMapping
    public ResponseEntity<OrderDto> create(@Valid @RequestBody OrderDto dto) {
        OrderDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<OrderDto>> getByPatient(@PathVariable Long patientId,
                                                        @RequestParam(required = false) String status) {
        if (status != null) {
            return ResponseEntity.ok(service.getByPatientIdAndStatus(patientId, status));
        }
        return ResponseEntity.ok(service.getByPatientId(patientId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<List<OrderDto>> getActiveOrders(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getActiveOrders(patientId));
    }

    @GetMapping("/type/{orderType}")
    public ResponseEntity<List<OrderDto>> getByOrderType(@PathVariable String orderType) {
        return ResponseEntity.ok(service.getByOrderType(orderType));
    }

    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderDto> getByOrderNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(service.getByOrderNumber(orderNumber));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrderDto> update(@PathVariable Long id, @Valid @RequestBody OrderDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<OrderDto> verify(@PathVariable Long id, @RequestParam Long staffId) {
        return ResponseEntity.ok(service.verifyOrder(id, staffId));
    }

    @PatchMapping("/{id}/discontinue")
    public ResponseEntity<OrderDto> discontinue(@PathVariable Long id, 
                                                @RequestParam Long staffId,
                                                @RequestParam(required = false) String reason) {
        return ResponseEntity.ok(service.discontinueOrder(id, staffId, reason));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

