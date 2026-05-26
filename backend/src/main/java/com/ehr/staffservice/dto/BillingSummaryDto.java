package com.ehr.staffservice.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BillingSummaryDto {
    private BigDecimal totalDue;
    private BigDecimal totalPaid;
    private Integer pendingStatements;
    private Integer overdueStatements;
    private LocalDate nextDueDate;
}

