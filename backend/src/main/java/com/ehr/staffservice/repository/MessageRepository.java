package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByThread_ThreadIdOrderBySentAtAsc(Long threadId);

    /**
     * Mark all unread messages in a thread as read for a specific patient.
     */
    @Modifying
    @Query("UPDATE Message m SET m.readAt = :readAt " +
           "WHERE m.thread.threadId = :threadId " +
           "AND m.senderType != 'PATIENT' " +
           "AND m.readAt IS NULL")
    int markThreadMessagesAsRead(@Param("threadId") Long threadId, @Param("readAt") LocalDateTime readAt);

    /**
     * Count unread messages for a patient across all threads.
     */
    @Query("SELECT COUNT(m) FROM Message m " +
           "JOIN m.thread.participants p " +
           "WHERE p.participantIdRef = :patientId " +
           "AND p.participantType = 'PATIENT' " +
           "AND m.senderType != 'PATIENT' " +
           "AND m.readAt IS NULL")
    long countUnreadMessagesForPatient(@Param("patientId") Long patientId);
}

