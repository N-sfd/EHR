package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "staff_licenses")
@Data
@EqualsAndHashCode(callSuper = false)
public class StaffLicense extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID licenseId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    private String licenseNumber;
    private String licenseType;
    private String issuedBy;

    private java.sql.Date expiryDate;
}
