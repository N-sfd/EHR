package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.entity.*;
import com.ehr.staffservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingStatementRepository statementRepository;
    private final PaymentRepository paymentRepository;

    /**
     * Get billing summary for a patient.
     */
    @Transactional(readOnly = true)
    public BillingSummaryDto getBillingSummary(Long patientId) {
        List<BillingStatement> statements = statementRepository.findByPatient_PatientIdOrderByDueDateDesc(patientId);
        if (statements == null) {
            statements = new ArrayList<>();
        }
        
        BillingSummaryDto summary = new BillingSummaryDto();
        BigDecimal totalDue = BigDecimal.ZERO;
        BigDecimal totalPaid = BigDecimal.ZERO;
        int pendingCount = 0;
        int overdueCount = 0;
        LocalDate nextDueDate = null;

        for (BillingStatement stmt : statements) {
            if (stmt == null) {
                continue;
            }
            
            if (stmt.getStatus() == BillingStatement.StatementStatus.PAID) {
                BigDecimal paidAmt = stmt.getPaidAmount();
                if (paidAmt != null) {
                    totalPaid = totalPaid.add(paidAmt);
                }
            } else {
                BigDecimal balance = stmt.getBalanceDue();
                if (balance != null) {
                    totalDue = totalDue.add(balance);
                }
                
                if (stmt.getStatus() == BillingStatement.StatementStatus.PENDING) {
                    pendingCount++;
                } else if (stmt.getStatus() == BillingStatement.StatementStatus.OVERDUE) {
                    overdueCount++;
                }
                
                // Find next due date (earliest unpaid statement)
                LocalDate dueDate = stmt.getDueDate();
                if (dueDate != null) {
                    if (nextDueDate == null || dueDate.isBefore(nextDueDate)) {
                        nextDueDate = dueDate;
                    }
                }
            }
        }

        summary.setTotalDue(totalDue);
        summary.setTotalPaid(totalPaid);
        summary.setPendingStatements(pendingCount);
        summary.setOverdueStatements(overdueCount);
        summary.setNextDueDate(nextDueDate);

        return summary;
    }

    /**
     * Get all billing statements for a patient.
     */
    @Transactional(readOnly = true)
    public List<BillingStatementDto> getStatementsForPatient(Long patientId) {
        List<BillingStatement> statements = statementRepository.findByPatient_PatientIdOrderByDueDateDesc(patientId);
        return statements.stream()
                .map(this::mapToStatementDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific billing statement by ID.
     */
    @Transactional(readOnly = true)
    public BillingStatementDto getStatementById(Long statementId, Long patientId) {
        BillingStatement statement = statementRepository.findByIdAndPatientId(statementId, patientId)
                .orElseThrow(() -> new RuntimeException("Statement not found or access denied"));
        return mapToStatementDto(statement);
    }

    /**
     * Record a payment.
     */
    @Transactional
    public PaymentDto recordPayment(Long patientId, CreatePaymentDto paymentDto) {
        BillingStatement statement = statementRepository.findByIdAndPatientId(
                paymentDto.getStatementId(), patientId)
                .orElseThrow(() -> new RuntimeException("Statement not found or access denied"));

        // Create payment
        Payment payment = new Payment();
        payment.setStatement(statement);
        payment.setPatient(statement.getPatient());
        payment.setAmount(paymentDto.getAmount());
        payment.setPaymentDate(LocalDate.now());
        payment.setPaymentMethod(Payment.PaymentMethod.valueOf(paymentDto.getPaymentMethod()));
        payment.setPaymentReference(paymentDto.getPaymentReference());
        payment.setNotes(paymentDto.getNotes());

        Payment saved = paymentRepository.save(payment);

        // Update statement
        statement.setPaidAmount(statement.getPaidAmount().add(paymentDto.getAmount()));
        statement.setBalanceDue(statement.getBalanceDue().subtract(paymentDto.getAmount()));

        // Update status
        if (statement.getBalanceDue().compareTo(BigDecimal.ZERO) <= 0) {
            statement.setStatus(BillingStatement.StatementStatus.PAID);
        } else if (statement.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            statement.setStatus(BillingStatement.StatementStatus.PARTIAL);
        }

        statementRepository.save(statement);

        return mapPaymentToDto(saved);
    }

    /**
     * Map BillingStatement to DTO.
     */
    private BillingStatementDto mapToStatementDto(BillingStatement statement) {
        BillingStatementDto dto = new BillingStatementDto();
        dto.setStatementId(statement.getStatementId());
        dto.setStatementNumber(statement.getStatementNumber());
        dto.setStatementDate(statement.getStatementDate());
        dto.setDueDate(statement.getDueDate());
        dto.setTotalAmount(statement.getTotalAmount());
        dto.setPaidAmount(statement.getPaidAmount());
        dto.setBalanceDue(statement.getBalanceDue());
        dto.setStatus(statement.getStatus().name());

        // Map line items
        List<BillingLineItemDto> lineItems = statement.getLineItems().stream()
                .map(this::mapLineItemToDto)
                .collect(Collectors.toList());
        dto.setLineItems(lineItems);

        // Map payments
        List<PaymentDto> payments = statement.getPayments().stream()
                .map(this::mapPaymentToDto)
                .collect(Collectors.toList());
        dto.setPayments(payments);

        return dto;
    }

    /**
     * Map BillingLineItem to DTO.
     */
    private BillingLineItemDto mapLineItemToDto(BillingLineItem item) {
        BillingLineItemDto dto = new BillingLineItemDto();
        dto.setLineItemId(item.getLineItemId());
        dto.setDescription(item.getDescription());
        dto.setServiceDate(item.getServiceDate());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setTotalPrice(item.getTotalPrice());
        return dto;
    }

    /**
     * Map Payment to DTO.
     */
    private PaymentDto mapPaymentToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPaymentMethod(payment.getPaymentMethod().name());
        dto.setPaymentReference(payment.getPaymentReference());
        dto.setNotes(payment.getNotes());
        return dto;
    }
}

