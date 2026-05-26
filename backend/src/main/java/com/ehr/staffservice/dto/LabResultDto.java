package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Lab result DTO for detail view.
 * Includes all fields for Epic-style lab result detail page.
 */
@Data
public class LabResultDto {
    private Long resultId;
    private Long patientId;
    private String panelName; // Test name/panel name
    private LocalDate orderDate;
    private LocalDate resultDate;
    private LocalDateTime collectedAt; // Optional: when specimen was collected
    private LocalDateTime resultedAt; // Optional: when result was finalized
    private String status; // PENDING, PRELIMINARY, FINAL, CANCELLED
    private Long orderingProviderId;
    private String orderingProviderName;
    private String facility; // Lab/facility name (alias for labName)
    private String labName; // Lab name
    private List<LabResultItemDto> items; // Components/test items
    private Integer abnormalCount; // Count of abnormal items
    private String comments; // Optional: provider comments
    private List<String> attachments; // Optional: attachment URLs (stub for now)
    private String overallStatus; // NORMAL, ABNORMAL, or CRITICAL (computed)
    
    /**
     * Determine overall status: NORMAL, ABNORMAL, or CRITICAL.
     * This method is used to compute the status if not already set.
     */
    public String getOverallStatus() {
        if (overallStatus != null) {
            return overallStatus;
        }
        if (abnormalCount == null || abnormalCount == 0) {
            return "NORMAL";
        }
        // Check if any item is CRITICAL
        if (items != null) {
            boolean hasCritical = items.stream()
                    .anyMatch(item -> item.getFlag() != null && "CRITICAL".equals(item.getFlag()));
            if (hasCritical) {
                return "CRITICAL";
            }
        }
        return "ABNORMAL";
    }
}
