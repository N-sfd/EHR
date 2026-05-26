package com.ehr.staffservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Daily Count DTO for scheduling summary
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyCountDto {
    private String date; // YYYY-MM-DD
    private Long count;
}

