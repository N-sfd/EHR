package com.ehr.staffservice.entity.scheduling;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schedule_templates", indexes = {
    @Index(name = "idx_schedule_provider", columnList = "provider_id"),
    @Index(name = "idx_schedule_day", columnList = "day_of_week")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class ScheduleTemplate extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "schedule_template_id")
    private Long id;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    private Provider provider;

    @Column(name = "day_of_week", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_duration", nullable = false)
    private Integer slotDuration; // in minutes

    @ElementCollection
    @CollectionTable(name = "schedule_blocked_ranges", joinColumns = @JoinColumn(name = "schedule_template_id"))
    @AttributeOverrides({
        @AttributeOverride(name = "startTime", column = @Column(name = "block_start_time")),
        @AttributeOverride(name = "endTime", column = @Column(name = "block_end_time"))
    })
    private List<TimeRange> blockedRanges = new ArrayList<>();

    @Column(name = "overbook_allowed")
    private Boolean overbookAllowed = false;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @Embeddable
    @Data
    public static class TimeRange {
        private LocalTime startTime;
        private LocalTime endTime;
    }

    public enum DayOfWeek {
        MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
    }
}

