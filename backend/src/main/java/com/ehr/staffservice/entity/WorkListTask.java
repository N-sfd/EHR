package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "work_list_tasks")
@Data
@EqualsAndHashCode(callSuper = false)
public class WorkListTask extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id")
    private Long taskId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "assigned_to_staff_id")
    private Long assignedToStaffId;

    @Column(name = "created_by_staff_id")
    private Long createdByStaffId;

    @Column(name = "task_type", length = 50, nullable = false)
    private String taskType; // PRN, Timed, Routine, Stat, etc.

    @Column(name = "priority", length = 20, nullable = false)
    private String priority; // Stat, High, Routine, Low

    @Column(name = "task_description", columnDefinition = "TEXT", nullable = false)
    private String taskDescription;

    @Column(name = "due_date_time")
    private LocalDateTime dueDateTime;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "department_id")
    private Long departmentId;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_staff_id", insertable = false, updatable = false)
    private Staff assignedToStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_staff_id", insertable = false, updatable = false)
    private Staff createdByStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;
}

