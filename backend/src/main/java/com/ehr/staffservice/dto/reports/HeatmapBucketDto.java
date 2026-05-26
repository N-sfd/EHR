package com.ehr.staffservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Heatmap Bucket DTO for scheduling summary
 * Represents appointment count for a specific day of week and hour
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class HeatmapBucketDto {
    private Integer dayOfWeek; // 0=Sunday, 1=Monday, ..., 6=Saturday
    private Integer hour; // 0-23
    private Long count;
}

