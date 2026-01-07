package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.LabResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LabResultRepository extends JpaRepository<LabResult, Long> {
    
    List<LabResult> findByPatientIdOrderByResultedDateTimeDesc(Long patientId);
    
    List<LabResult> findByPatientIdAndStatusOrderByResultedDateTimeDesc(Long patientId, String status);
    
    List<LabResult> findByPatientIdAndTestCategoryOrderByResultedDateTimeDesc(Long patientId, String testCategory);
    
    @Query("SELECT lr FROM LabResult lr WHERE lr.patientId = :patientId AND lr.resultedDateTime BETWEEN :startDate AND :endDate ORDER BY lr.resultedDateTime DESC")
    List<LabResult> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);
    
    List<LabResult> findByIsCriticalAndCriticalValueNotifiedOrderByResultedDateTimeDesc(Boolean isCritical, Boolean notified);
    
    List<LabResult> findByStatusOrderByResultedDateTimeDesc(String status);
}

