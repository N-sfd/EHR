package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.VitalSign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VitalSignRepository extends JpaRepository<VitalSign, Long> {
    
    List<VitalSign> findByPatientIdOrderByRecordedAtDesc(Long patientId);
    
    @Query("SELECT v FROM VitalSign v WHERE v.patientId = :patientId AND v.recordedAt BETWEEN :startDate AND :endDate ORDER BY v.recordedAt DESC")
    List<VitalSign> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                         @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
    
    VitalSign findFirstByPatientIdOrderByRecordedAtDesc(Long patientId);
}

