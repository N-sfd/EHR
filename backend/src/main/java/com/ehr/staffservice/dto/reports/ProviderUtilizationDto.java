package com.ehr.staffservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Provider Utilization Report DTO
 * Response for GET /api/reports/scheduling/provider-utilization
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProviderUtilizationDto {
    private Long doctorId;
    private String doctorName;
    private Long totalAppointments;
    private Long totalMinutesBooked;
}

