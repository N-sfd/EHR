package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Data
public class ScheduleGridDto {
    private Long doctorId;
    private String doctorName;
    private LocalDate scheduleDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotIntervalMinutes;
    private String location;
    private List<TimeSlotDto> timeSlots;
    
    @Data
    public static class TimeSlotDto {
        private LocalTime startTime;
        private LocalTime endTime;
        private String status; // AVAILABLE, BOOKED, OVERBOOK, BLOCKED
        private String colorCode; // blue, red, yellow, green
        private AppointmentSlotDto appointment;
        private Boolean isSelectable;
    }
    
    @Data
    public static class AppointmentSlotDto {
        private Long appointmentId;
        private String appointmentCode;
        private Long patientId;
        private String patientName;
        private String visitType; // New, Follow-up
        private Integer durationMinutes;
        private String status;
    }
}

