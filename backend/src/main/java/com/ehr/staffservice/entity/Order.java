package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@EqualsAndHashCode(callSuper = false)
public class Order extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Long orderId;

    @Column(name = "order_number", unique = true, length = 50)
    private String orderNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "ordered_by_staff_id", nullable = false)
    private Long orderedByStaffId;

    @Column(name = "order_type", length = 50, nullable = false)
    private String orderType; // MEDICATION, LAB, IMAGING, PROCEDURE, DIET, ACTIVITY, etc.

    @Column(name = "order_category", length = 50)
    private String orderCategory; // Routine, Stat, Now, PRN, etc.

    @Column(name = "order_description", columnDefinition = "TEXT", nullable = false)
    private String orderDescription;

    @Column(name = "order_details", columnDefinition = "TEXT")
    private String orderDetails; // Detailed instructions

    @Column(name = "start_date_time")
    private LocalDateTime startDateTime;

    @Column(name = "end_date_time")
    private LocalDateTime endDateTime;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // PENDING, ACTIVE, COMPLETED, CANCELLED, ON_HOLD

    @Column(name = "priority", length = 20)
    private String priority; // Routine, Stat, Urgent

    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "verified_by_staff_id")
    private Long verifiedByStaffId;

    @Column(name = "verified_date_time")
    private LocalDateTime verifiedDateTime;

    @Column(name = "discontinued_by_staff_id")
    private Long discontinuedByStaffId;

    @Column(name = "discontinued_date_time")
    private LocalDateTime discontinuedDateTime;

    @Column(name = "discontinuation_reason", columnDefinition = "TEXT")
    private String discontinuationReason;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordered_by_staff_id", insertable = false, updatable = false)
    private Staff orderedByStaff;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;
}

