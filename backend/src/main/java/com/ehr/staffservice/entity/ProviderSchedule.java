package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "provider_schedules")
@Data
@EqualsAndHashCode(callSuper = false)
public class ProviderSchedule extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "schedule_date", nullable = false)
    private LocalDate scheduleDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_interval_minutes")
    private Integer slotIntervalMinutes = 15; // 15 or 30 minutes

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "is_available")
    private Boolean isAvailable = true;

    @Column(name = "block_reason", length = 200)
    private String blockReason; // "Lunch", "Meeting", "Vacation", etc.

    @Column(name = "max_appointments")
    private Integer maxAppointments;

    @Column(name = "allow_overbooking")
    private Boolean allowOverbooking = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
}

