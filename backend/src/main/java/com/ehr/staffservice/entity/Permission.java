package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "permissions")
@Data
@EqualsAndHashCode(callSuper = false)
public class Permission extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    private Long permissionId;

    @Column(name = "name", nullable = false, unique = true)
    private String name;        // e.g. "STAFF_VIEW"

    @Column(name = "module", nullable = false)
    private String module;      // e.g. "HRM"

    @Column(name = "action", nullable = false)
    private String action;      // e.g. "VIEW", "EDIT"
}

