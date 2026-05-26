package com.ehr.staffservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class BillingStatementDto {
    private Long statementId;
    private String statementNumber;
    private LocalDate statementDate;
    private LocalDate dueDate;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal balanceDue;
    private String status; // PENDING, PARTIAL, PAID, OVERDUE
    private List<BillingLineItemDto> lineItems;
    private List<PaymentDto> payments;
}

