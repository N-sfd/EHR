package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "appointments")
@Data
@EqualsAndHashCode(callSuper = false)
public class Appointment extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "appointment_code", unique = true, length = 20, nullable = false)
    private String appointmentCode; // e.g., "AP544658"

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "appointment_type", length = 20, nullable = false)
    private String appointmentType; // "In Person" or "Online"

    @Column(name = "visit_type", length = 50)
    private String visitType; // "New", "Follow-up", "Consultation", "Procedure", etc.

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private LocalTime appointmentTime;

    @Column(name = "end_time")
    private LocalTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes; // 15, 30, 45, 60 minutes

    @Column(name = "slot_status", length = 20)
    private String slotStatus; // "AVAILABLE", "BOOKED", "OVERBOOK", "BLOCKED"

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // "Schedule", "Confirmed", "Checked In", "Checked Out", "Cancelled"

    @Column(name = "color_code", length = 20)
    private String colorCode; // For calendar color coding - "blue", "red", "yellow", "green"

    @Column(name = "location", length = 100)
    private String location; // Room number, address, etc.

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Recurrence fields
    @Column(name = "is_recurring")
    private Boolean isRecurring = false;

    @Column(name = "recurrence_pattern", length = 50)
    private String recurrencePattern; // DAILY, WEEKLY, MONTHLY, YEARLY

    @Column(name = "recurrence_end_date")
    private LocalDate recurrenceEndDate;

    @Column(name = "recurrence_interval")
    private Integer recurrenceInterval; // Every N days/weeks/months

    @Column(name = "parent_appointment_id")
    private Long parentAppointmentId; // For recurring series

    // Optional: Many-to-One relationships for joins (read-only)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private Staff doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;
}
