package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.time.LocalTime;
import java.sql.Timestamp;

@Data
public class AppointmentDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long appointmentId;

    @NotBlank(message = "Appointment code is required")
    private String appointmentCode; // e.g., "AP544658"

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotNull(message = "Doctor ID is required")
    private Long doctorId;

    private Long departmentId;

    @NotBlank(message = "Appointment type is required")
    private String appointmentType; // "In Person" or "Online"

    @NotNull(message = "Appointment date is required")
    private LocalDate appointmentDate;

    @NotNull(message = "Appointment time is required")
    private LocalTime appointmentTime;

    private LocalTime endTime;

    private Integer durationMinutes; // Default 30 minutes

    private String reason;

    @NotBlank(message = "Status is required")
    private String status; // "Schedule", "Confirmed", "Checked In", "Checked Out", "Cancelled"

    private String colorCode; // For calendar color coding

    private String location; // Room number, address, etc.

    private String notes;

    // Recurrence fields
    private Boolean isRecurring = false;

    private String recurrencePattern; // DAILY, WEEKLY, MONTHLY, YEARLY

    private LocalDate recurrenceEndDate;

    private Integer recurrenceInterval; // Every N days/weeks/months

    private Long parentAppointmentId; // For recurring series

    // Populated fields for display
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String patientName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String patientPhone;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String doctorName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String doctorImage;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String patientImage;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String departmentName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Timestamp createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Timestamp updatedAt;
}
