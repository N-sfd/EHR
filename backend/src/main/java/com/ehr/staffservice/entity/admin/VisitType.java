package com.ehr.staffservice.entity.admin;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "visit_types")
@Data
@EqualsAndHashCode(callSuper = false)
public class VisitType extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "visit_type_id")
    private Long id;

    @Column(name = "name", length = 100, nullable = false, unique = true)
    private String name;

    @Column(name = "duration_mins", nullable = false)
    private Integer durationMins;

    @ElementCollection
    @CollectionTable(name = "visit_type_departments", joinColumns = @JoinColumn(name = "visit_type_id"))
    @Column(name = "department_id")
    private List<Long> allowedDepartmentIds = new ArrayList<>();

    @Column(name = "allow_overbook")
    private Boolean allowOverbook = false;

    @ElementCollection
    @CollectionTable(name = "visit_type_resources", joinColumns = @JoinColumn(name = "visit_type_id"))
    @Column(name = "resource")
    private List<String> requiredResources = new ArrayList<>();

    @Column(name = "is_active")
    private Boolean isActive = true;
}

