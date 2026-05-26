package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lab_result")
@Data
@EqualsAndHashCode
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Long resultId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "panel_name", nullable = false, length = 200)
    private String panelName;

    @Column(name = "order_date", nullable = false)
    private LocalDate orderDate;

    @Column(name = "result_date")
    private LocalDate resultDate;

    @Column(nullable = false, length = 50)
    @Enumerated(EnumType.STRING)
    private ResultStatus status = ResultStatus.FINAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordering_provider_id")
    private Staff orderingProvider;

    @Column(name = "lab_name", length = 200)
    private String labName;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "result", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<LabResultItem> items = new ArrayList<>();

    public enum ResultStatus {
        PENDING, PRELIMINARY, FINAL, CANCELLED
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
