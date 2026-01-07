package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.util.UUID;

@Entity
@Table(name = "staff_awards")
@Data
@EqualsAndHashCode(callSuper = false)
public class StaffAward extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID awardId;

    @Column(name = "staff_id", nullable = false)
    private UUID staffId;

    private String name;
    private String awardedBy;

    private java.sql.Date awardDate;
}
