package com.ehr.staffservice.dto;

/**
 * Stable contract for {@code GET /api/features} (admin + patient portals).
 */
public record FeatureFlagsResponse(boolean aiEnabled, boolean aiAuditEnabled, boolean aiStreamingEnabled) {
}
