package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Entity
@Table(name = "services")
@Data
@EqualsAndHashCode(callSuper = false)
public class Service extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "service_id")
    private Long serviceId;

    @Column(name = "service_name", nullable = false, length = 200)
    @NotBlank
    private String serviceName;

    @Column(name = "department_id", nullable = false)
    @NotNull
    private Long departmentId;

    @Column(name = "price", nullable = false, columnDefinition = "DECIMAL(10,2)")
    @NotNull
    @Positive
    private BigDecimal price;

    @Column(name = "status", length = 20, nullable = false)
    @NotBlank
    private String status = "Active"; // Active / Inactive

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    // Many-to-One relationship with Department (optional, for joins)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", insertable = false, updatable = false)
    private Department department;
}

