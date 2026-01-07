package com.ehr.staffservice.entity.scheduling;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "providers", indexes = {
    @Index(name = "idx_provider_department", columnList = "department_id")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class Provider extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "provider_id")
    private Long id;

    @Column(name = "first_name", length = 100, nullable = false)
    private String firstName;

    @Column(name = "last_name", length = 100, nullable = false)
    private String lastName;

    @Column(name = "specialty", length = 100)
    private String specialty;

    @Column(name = "department_id")
    private Long departmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;

    @Column(name = "is_active")
    private Boolean isActive = true;
}

