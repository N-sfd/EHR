package com.ehr.staffservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PaymentDto {
    private Long paymentId;
    private BigDecimal amount;
    private LocalDate paymentDate;
    private String paymentMethod; // CREDIT_CARD, DEBIT_CARD, CHECK, CASH, ONLINE
    private String paymentReference;
    private String notes;
}

