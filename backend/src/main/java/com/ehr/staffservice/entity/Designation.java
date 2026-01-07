package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "designations")
@Data
@EqualsAndHashCode(callSuper = false)
public class Designation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long designationId;

    @Column(nullable = false, length = 150)
    private String title;          // "Staff Nurse", "Consultant", "Receptionist"

    @Column(length = 50, unique = true)
    private String code;           // "STAFF_NURSE", "CONSULTANT", "RECEPTIONIST"

    @Column(length = 50)
    private String category;       // "CLINICAL", "NON_CLINICAL", "ADMIN"

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;   // optional link to department

    @Column(name = "managerial")
    private Boolean managerial = false;  // is it a supervisor/manager role?

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 20)
    private String status = "ACTIVE";    // ACTIVE / INACTIVE
}

