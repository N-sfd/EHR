package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "staff_education")
@Data
@EqualsAndHashCode(callSuper = false)
public class StaffEducation extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID eduId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    private String degree;
    private String university;

    private java.sql.Date startDate;
    private java.sql.Date endDate;
}
