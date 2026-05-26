package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.MessageThread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface MessageThreadRepository extends JpaRepository<MessageThread, Long> {

    /**
     * Find all threads where the patient is a participant.
     * Returns threads ordered by most recent message first.
     */
    @Query("SELECT DISTINCT t FROM MessageThread t " +
           "JOIN t.participants p " +
           "WHERE p.participantIdRef = :patientId " +
           "AND p.participantType = 'PATIENT' " +
           "ORDER BY t.updatedAt DESC")
    List<MessageThread> findByPatientId(@Param("patientId") Long patientId);

    /**
     * Find thread by ID, ensuring patient is a participant.
     */
    @Query("SELECT t FROM MessageThread t " +
           "JOIN t.participants p " +
           "WHERE t.threadId = :threadId " +
           "AND p.participantIdRef = :patientId " +
           "AND p.participantType = 'PATIENT'")
    Optional<MessageThread> findByIdAndPatientId(@Param("threadId") Long threadId, @Param("patientId") Long patientId);
}

