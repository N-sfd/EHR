package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.service.BillingService;
import com.ehr.staffservice.service.SessionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller for patient billing.
 * All endpoints require PATIENT role and use patientId from session.
 */
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientBillingController {

    private final BillingService billingService;

    /**
     * Get billing summary for the current patient.
     * GET /api/billing/summary
     */
    @GetMapping("/summary")
    public ResponseEntity<BillingSummaryDto> getBillingSummary(
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        BillingSummaryDto summary = billingService.getBillingSummary(patientId);
        return ResponseEntity.ok(summary);
    }

    /**
     * Get all billing statements for the current patient.
     * GET /api/billing/statements
     */
    @GetMapping("/statements")
    public ResponseEntity<List<BillingStatementDto>> getStatements(
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<BillingStatementDto> statements = billingService.getStatementsForPatient(patientId);
        return ResponseEntity.ok(statements);
    }

    /**
     * Get a specific billing statement by ID.
     * GET /api/billing/statements/{id}
     */
    @GetMapping("/statements/{id}")
    public ResponseEntity<BillingStatementDto> getStatement(
            @PathVariable Long id,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            BillingStatementDto statement = billingService.getStatementById(id, patientId);
            return ResponseEntity.ok(statement);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Record a payment.
     * POST /api/billing/payments
     */
    @PostMapping("/payments")
    public ResponseEntity<PaymentDto> recordPayment(
            @Valid @RequestBody CreatePaymentDto paymentDto,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            PaymentDto payment = billingService.recordPayment(patientId, paymentDto);
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Create payment intent (stub for future payment processing).
     * POST /api/billing/payments/intent
     */
    @PostMapping("/payments/intent")
    public ResponseEntity<Map<String, Object>> createPaymentIntent(
            @RequestBody Map<String, Object> request,
            @RequestAttribute("sessionData") SessionService.SessionData session) {
        
        Long patientId = session.getPatientId();
        if (patientId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Stub implementation - returns mock payment intent
        Map<String, Object> intent = new HashMap<>();
        intent.put("intentId", "pi_" + System.currentTimeMillis());
        intent.put("clientSecret", "mock_secret_" + System.currentTimeMillis());
        intent.put("status", "requires_payment_method");
        
        return ResponseEntity.ok(intent);
    }
}

