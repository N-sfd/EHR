package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "staff_certifications")
@Data
@EqualsAndHashCode(callSuper = false)
public class StaffCertification extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID certId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    private String name;
    private String issuedBy;

    private java.sql.Date issueDate;
}
