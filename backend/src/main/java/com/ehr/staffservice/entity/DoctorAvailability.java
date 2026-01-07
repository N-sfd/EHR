package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalTime;

@Entity
@Table(name = "doctor_availability")
@Data
@EqualsAndHashCode(callSuper = false)
public class DoctorAvailability extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "doctor_id", nullable = false)
    private Long doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", insertable = false, updatable = false)
    private Doctor doctor;

    @Column(length = 20)
    private String dayOfWeek;  // MONDAY, TUESDAY, etc.

    private LocalTime startTime;
    private LocalTime endTime;

    @Column(length = 30)
    private String availabilityType; // REGULAR, ON_CALL, etc.
}

