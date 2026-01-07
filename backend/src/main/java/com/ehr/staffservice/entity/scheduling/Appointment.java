package com.ehr.staffservice.entity.scheduling;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity(name = "SchedulingAppointment")
@Table(name = "scheduling_appointments", indexes = {
    @Index(name = "idx_appointment_patient", columnList = "patient_id"),
    @Index(name = "idx_appointment_provider", columnList = "provider_id"),
    @Index(name = "idx_appointment_date", columnList = "start_date_time"),
    @Index(name = "idx_appointment_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class Appointment extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "appointment_id")
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "visit_type_id")
    private Long visitTypeId;

    @Column(name = "start_date_time", nullable = false)
    private LocalDateTime startDateTime;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private AppointmentStatus status;

    @Column(name = "reason", columnDefinition = "TEXT")
    private String reason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    private Provider provider;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    public enum AppointmentStatus {
        REQUESTED,
        SCHEDULED,
        CANCELED,
        ARRIVED,
        CHECKED_IN,
        IN_PROGRESS,
        COMPLETED
    }
}

