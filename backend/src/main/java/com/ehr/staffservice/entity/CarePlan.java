package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Table(name = "care_plans")
@Data
@EqualsAndHashCode(callSuper = false)
public class CarePlan extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "care_plan_id")
    private Long carePlanId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "problem_category", length = 100, nullable = false)
    private String problemCategory; // Pain - Acute, Discharge Planning, etc.

    @Column(name = "problem_description", columnDefinition = "TEXT", nullable = false)
    private String problemDescription;

    @Column(name = "goal_description", columnDefinition = "TEXT", nullable = false)
    private String goalDescription;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // ACTIVE, RESOLVED, ON_HOLD

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "target_date")
    private LocalDate targetDate;

    @Column(name = "resolved_date")
    private LocalDate resolvedDate;

    @Column(name = "created_by_staff_id")
    private Long createdByStaffId;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_staff_id", insertable = false, updatable = false)
    private Staff createdByStaff;
}

