package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "role_permissions", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"role_id", "permission_id"}))
@Data
@EqualsAndHashCode(callSuper = false)
public class RolePermission extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "role_id", nullable = false)
    private Long roleId;

    @Column(name = "permission_id", nullable = false)
    private Long permissionId;
}

