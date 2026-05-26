package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {

    /**
     * Find all lab results for a patient within a date range.
     * Ordered by result date descending (most recent first).
     */
    @Query("SELECT r FROM LabResult r " +
           "WHERE r.patient.patientId = :patientId " +
           "AND (:fromDate IS NULL OR r.resultDate >= :fromDate) " +
           "AND (:toDate IS NULL OR r.resultDate <= :toDate) " +
           "ORDER BY r.resultDate DESC NULLS LAST, r.orderDate DESC")
    List<LabResult> findByPatientIdAndDateRange(
            @Param("patientId") Long patientId,
            @Param("fromDate") LocalDate fromDate,
            @Param("toDate") LocalDate toDate
    );

    /**
     * Find a specific lab result by ID, ensuring it belongs to the patient.
     */
    @Query("SELECT r FROM LabResult r " +
           "WHERE r.resultId = :resultId " +
           "AND r.patient.patientId = :patientId")
    Optional<LabResult> findByIdAndPatientId(
            @Param("resultId") Long resultId,
            @Param("patientId") Long patientId
    );
}
