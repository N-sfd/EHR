package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ClinicalAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClinicalAlertRepository extends JpaRepository<ClinicalAlert, Long> {
    
    List<ClinicalAlert> findByPatientId(Long patientId);
    
    List<ClinicalAlert> findByPatientIdAndStatus(Long patientId, ClinicalAlert.AlertStatus status);
    
    List<ClinicalAlert> findByStatus(ClinicalAlert.AlertStatus status);
    
    List<ClinicalAlert> findByAlertType(ClinicalAlert.AlertType alertType);
    
    List<ClinicalAlert> findByPriority(ClinicalAlert.AlertPriority priority);
    
    @Query("SELECT a FROM ClinicalAlert a WHERE a.patientId = :patientId AND a.status = 'ACTIVE' ORDER BY a.priority DESC, a.triggeredAt DESC")
    List<ClinicalAlert> findActiveAlertsByPatientId(@Param("patientId") Long patientId);
    
    @Query("SELECT a FROM ClinicalAlert a WHERE a.status = 'ACTIVE' AND (a.expiresAt IS NULL OR a.expiresAt > :now) ORDER BY a.priority DESC, a.triggeredAt DESC")
    List<ClinicalAlert> findActiveAlerts(@Param("now") LocalDateTime now);
    
    @Query("SELECT a FROM ClinicalAlert a WHERE a.acknowledgedByStaffId = :staffId AND a.acknowledgedAt >= :startDate")
    List<ClinicalAlert> findByAcknowledgedByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                                                 @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT a FROM ClinicalAlert a WHERE a.relatedEntityType = :entityType AND a.relatedEntityId = :entityId")
    List<ClinicalAlert> findByRelatedEntity(@Param("entityType") String entityType, 
                                             @Param("entityId") Long entityId);
}

