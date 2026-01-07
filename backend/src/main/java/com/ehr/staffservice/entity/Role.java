package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "roles")
@Data
@EqualsAndHashCode(callSuper = false)
public class Role extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long roleId;

    @Column(nullable = false, length = 100, unique = true)
    private String name;        // "Admin", "Doctor", "Receptionist"

    @Column(length = 50, unique = true)
    private String code;        // "ADMIN", "DOCTOR", "RECEPTIONIST"

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 30)
    private String roleType;    // "SYSTEM", "CLINICAL", "NON_CLINICAL"

    @Column(name = "is_default")
    private Boolean isDefault = false;   // default role for new staff?

    @Column(length = 20)
    private String status = "ACTIVE";    // ACTIVE / INACTIVE
}

