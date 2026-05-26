package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.QuestionnaireAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionnaireAssignmentRepository extends JpaRepository<QuestionnaireAssignment, Long> {
    
    @Query("SELECT a FROM QuestionnaireAssignment a " +
           "WHERE a.patient.patientId = :patientId " +
           "ORDER BY a.dueDate ASC, a.createdAt DESC")
    List<QuestionnaireAssignment> findByPatient_PatientIdOrderByDueDateAsc(@Param("patientId") Long patientId);

    @Query("SELECT a FROM QuestionnaireAssignment a " +
           "WHERE a.assignmentId = :assignmentId " +
           "AND a.patient.patientId = :patientId")
    Optional<QuestionnaireAssignment> findByIdAndPatientId(
            @Param("assignmentId") Long assignmentId,
            @Param("patientId") Long patientId
    );
}

