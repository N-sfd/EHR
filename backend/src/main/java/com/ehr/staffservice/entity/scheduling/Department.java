package com.ehr.staffservice.entity.scheduling;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity(name = "SchedulingDepartment")
@Table(name = "scheduling_departments")
@Data
@EqualsAndHashCode(callSuper = false)
public class Department extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "department_id")
    private Long id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "is_active")
    private Boolean isActive = true;
}

