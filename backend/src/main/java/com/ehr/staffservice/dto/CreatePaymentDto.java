package com.ehr.staffservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class CreatePaymentDto {
    @NotNull(message = "Statement ID is required")
    private Long statementId;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be positive")
    private BigDecimal amount;
    
    @NotNull(message = "Payment method is required")
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, CHECK, CASH, ONLINE
    
    private String paymentReference;
    private String notes;
}

