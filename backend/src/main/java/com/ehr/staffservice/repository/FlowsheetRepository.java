package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Flowsheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FlowsheetRepository extends JpaRepository<Flowsheet, Long> {
    
    List<Flowsheet> findByPatientId(Long patientId);
    
    List<Flowsheet> findByPatientIdAndFlowsheetType(Long patientId, String flowsheetType);
    
    List<Flowsheet> findByPatientIdAndStatus(Long patientId, Flowsheet.FlowsheetStatus status);
    
    @Query("SELECT f FROM Flowsheet f WHERE f.patientId = :patientId AND f.recordedAt >= :startDate AND f.recordedAt <= :endDate ORDER BY f.recordedAt DESC")
    List<Flowsheet> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                  @Param("startDate") LocalDateTime startDate, 
                                                  @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT f FROM Flowsheet f WHERE f.recordedByStaffId = :staffId AND f.recordedAt >= :startDate")
    List<Flowsheet> findByRecordedByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                                         @Param("startDate") LocalDateTime startDate);
    
    List<Flowsheet> findByTemplateId(Long templateId);
}

