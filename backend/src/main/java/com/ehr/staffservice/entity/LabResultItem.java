package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "lab_result_item")
@Data
@EqualsAndHashCode
public class LabResultItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "result_id", nullable = false)
    private LabResult result;

    @Column(name = "test_name", nullable = false, length = 200)
    private String testName;

    @Column(length = 100)
    private String value;

    @Column(length = 50)
    private String units;

    @Column(name = "reference_range", length = 100)
    private String referenceRange;

    @Column(length = 20)
    @Enumerated(EnumType.STRING)
    private ResultFlag flag;

    @Column(nullable = false)
    private Boolean abnormal = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    public enum ResultFlag {
        L,  // Low
        H,  // High
        CRITICAL
    }
}

