package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "specializations")
@Data
@EqualsAndHashCode(callSuper = false)
public class Specialization extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long specializationId;

    @Column(nullable = false, length = 150, unique = true)
    private String name;          // "Cardiology", "Pediatrics"

    @Column(length = 50, unique = true)
    private String code;          // "CARDIO", "PEDIATRICS"

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;   // optional link to department

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 20)
    private String status = "ACTIVE";    // ACTIVE / INACTIVE
}

