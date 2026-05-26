package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDateTime;

@Entity
@Table(name = "message_participant", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"thread_id", "participant_id_ref", "participant_type"})
})
@Data
@EqualsAndHashCode
public class MessageParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "participant_id")
    private Long participantId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "thread_id", nullable = false)
    private MessageThread thread;

    @Column(name = "participant_id_ref", nullable = false)
    private Long participantIdRef; // patient_id or staff_id

    @Column(name = "participant_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private MessageThread.ParticipantType participantType;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
    }
}

