package com.ehr.staffservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillingLineItemDto {
    private Long lineItemId;
    private String description;
    private LocalDate serviceDate;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
}

