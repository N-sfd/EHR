package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "imaging_studies")
@Data
@EqualsAndHashCode(callSuper = false)
public class ImagingStudy extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "imaging_study_id")
    private Long imagingStudyId;

    @Column(name = "study_number", unique = true, length = 50)
    private String studyNumber;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "order_id")
    private Long orderId; // Link to order if applicable

    @Column(name = "study_type", length = 100, nullable = false)
    private String studyType; // X-Ray, CT, MRI, Ultrasound, etc.

    @Column(name = "body_part", length = 100)
    private String bodyPart; // Chest, Abdomen, Head, etc.

    @Column(name = "study_description", columnDefinition = "TEXT", nullable = false)
    private String studyDescription;

    @Column(name = "modality", length = 50)
    private String modality; // XR, CT, MR, US, etc.

    @Column(name = "scheduled_date_time")
    private LocalDateTime scheduledDateTime;

    @Column(name = "performed_date_time")
    private LocalDateTime performedDateTime;

    @Column(name = "completed_date_time")
    private LocalDateTime completedDateTime;

    @Column(name = "ordered_by_staff_id")
    private Long orderedByStaffId;

    @Column(name = "performed_by_staff_id")
    private Long performedByStaffId;

    @Column(name = "interpreted_by_staff_id")
    private Long interpretedByStaffId;

    @Column(name = "status", length = 20, nullable = false)
    private String status; // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED, PRELIMINARY, FINAL

    @Column(name = "priority", length = 20)
    private String priority; // Routine, Stat, Urgent

    @Column(name = "contrast_used", nullable = false)
    private Boolean contrastUsed = false;

    @Column(name = "contrast_type", length = 100)
    private String contrastType;

    @Column(name = "findings", columnDefinition = "TEXT")
    private String findings; // Radiologist findings

    @Column(name = "impression", columnDefinition = "TEXT")
    private String impression; // Radiologist impression

    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls; // Comma-separated URLs or JSON

    @Column(name = "report_url", columnDefinition = "TEXT")
    private String reportUrl; // Link to full report

    @Column(name = "is_preliminary", nullable = false)
    private Boolean isPreliminary = false;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", insertable = false, updatable = false)
    private Patient patient;
}

