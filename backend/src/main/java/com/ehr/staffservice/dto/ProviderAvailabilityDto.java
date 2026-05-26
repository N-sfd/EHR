package com.ehr.staffservice.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO for provider availability response.
 * Returns available 15-minute time slots for a given date.
 */
@Data
public class ProviderAvailabilityDto {
    private Long providerId;
    private String date; // YYYY-MM-DD format
    private List<String> availableSlots; // List of time strings in "HH:mm" format (e.g., "09:00", "09:15", "09:30")
    private Integer startHour; // Default 8 (8 AM)
    private Integer endHour; // Default 17 (5 PM)
}

