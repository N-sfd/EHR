package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "departments")
@Data
@EqualsAndHashCode(callSuper = false)
public class Department extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long departmentId;

    @Column(name = "department_name", nullable = false, length = 150, unique = true)
    private String name;           // "Cardiology", "OPD", "Billing"

    @Column(length = 50, unique = true)
    private String code;           // "DEPT_CARDIO", "DEPT_OPD"

    @Column(length = 50)
    private String type;           // "CLINICAL", "SUPPORT", "ADMIN"

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 30)
    private String phoneNumber;

    @Column(length = 150)
    private String email;

    @Column(length = 20)
    private String status = "ACTIVE"; // Active / Inactive
}

