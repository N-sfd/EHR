package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.OptimisticLocking;

import java.time.LocalDateTime;

/**
 * Appointment Entity (Production-Grade)
 * Uses startAt/endAt timestamps, optimistic locking, and proper relationships
 */
@Entity
@Table(name = "appointment", indexes = {
    @Index(name = "idx_appointment_doctor_start", columnList = "doctor_id,start_datetime"),
    @Index(name = "idx_appointment_patient_start", columnList = "patient_id,start_datetime"),
    @Index(name = "idx_appointment_start_datetime", columnList = "start_datetime"),
    @Index(name = "idx_appointment_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = false)
@OptimisticLocking
public class Appointment extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "room_id")
    private Long roomId;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endAt;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "visit_type_id")
    private Long visitTypeId;

    @Column(name = "visit_type", length = 50)
    private String visitType; // String fallback if visit_type_id is null

    @Column(name = "appointment_type", length = 30)
    private String appointmentType = "IN_PERSON"; // Store as string, not enum

    @Column(name = "status", length = 30, nullable = false)
    private String status = "SCHEDULED"; // Store as string, not enum

    @Column(name = "priority", length = 20, nullable = false)
    private String priority = "NORMAL"; // Store as string, not enum

    @Column(name = "reason", length = 255)
    private String reason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    // Relationships (read-only for joins)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false, referencedColumnName = "staff_id")
    private Doctor doctor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "visit_type_id", insertable = false, updatable = false)
    private com.ehr.staffservice.entity.admin.VisitType visitTypeEntity;

    // Enum constants for validation (not stored as enum in DB)
    public static class AppointmentType {
        public static final String IN_PERSON = "IN_PERSON";
        public static final String TELEHEALTH = "TELEHEALTH";
    }

    public static class AppointmentStatus {
        public static final String SCHEDULED = "SCHEDULED";
        public static final String CONFIRMED = "CONFIRMED";
        public static final String PRECHECKIN_COMPLETE = "PRECHECKIN_COMPLETE";
        public static final String ARRIVED = "ARRIVED";
        public static final String CHECKED_IN = "CHECKED_IN";
        public static final String CHECKED_OUT = "CHECKED_OUT";
        public static final String CANCELLED = "CANCELLED";
        public static final String NO_SHOW = "NO_SHOW";
    }

    public static class AppointmentPriority {
        public static final String NORMAL = "NORMAL";
        public static final String HIGH = "HIGH";
        public static final String URGENT = "URGENT";
    }
}

