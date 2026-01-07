package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalTime;

@Data
public class DoctorAvailabilityDto {
    private Long id;
    private Long doctorId;
    private String dayOfWeek;  // MONDAY, TUESDAY, etc.
    private LocalTime startTime;
    private LocalTime endTime;
    private String availabilityType; // REGULAR, ON_CALL, etc.
}

