package com.ehr.staffservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Scheduling Summary Report DTO
 * Response for GET /api/reports/scheduling/summary
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchedulingSummaryDto {
    private Long totalAppointments;
    private Long urgentCount;
    private Map<String, Long> statusCounts;
    private List<DailyCountDto> dailyCounts;
    private List<HeatmapBucketDto> heatmapBuckets;
}

