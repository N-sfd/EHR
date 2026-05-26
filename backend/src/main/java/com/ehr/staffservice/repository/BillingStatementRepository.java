package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.BillingStatement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillingStatementRepository extends JpaRepository<BillingStatement, Long> {
    
    @Query("SELECT s FROM BillingStatement s " +
           "WHERE s.patient.patientId = :patientId " +
           "ORDER BY s.dueDate DESC, s.statementDate DESC")
    List<BillingStatement> findByPatient_PatientIdOrderByDueDateDesc(@Param("patientId") Long patientId);

    @Query("SELECT s FROM BillingStatement s " +
           "WHERE s.statementId = :statementId " +
           "AND s.patient.patientId = :patientId")
    Optional<BillingStatement> findByIdAndPatientId(
            @Param("statementId") Long statementId,
            @Param("patientId") Long patientId
    );
}

