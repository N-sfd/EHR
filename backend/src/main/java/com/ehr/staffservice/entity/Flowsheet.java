package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Entity
@Table(name = "flowsheets")
@Data
@EqualsAndHashCode(callSuper = false)
public class Flowsheet extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "flowsheet_name", nullable = false, length = 200)
    private String flowsheetName;

    @Column(name = "flowsheet_type", nullable = false, length = 100)
    private String flowsheetType; // Custom, Standard, Template

    @Column(name = "recorded_at", nullable = false)
    private LocalDateTime recordedAt;

    @Column(name = "recorded_by_staff_id", nullable = false)
    private Long recordedByStaffId;

    @Column(name = "data", columnDefinition = "TEXT")
    private String data; // JSON string for flexible data storage

    @Column(name = "template_id")
    private Long templateId; // Reference to flowsheet template if applicable

    @Column(name = "status", nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private FlowsheetStatus status;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "location", length = 200)
    private String location; // Where the flowsheet was recorded

    public enum FlowsheetStatus {
        DRAFT,
        FINAL,
        AMENDED,
        DELETED
    }
}

