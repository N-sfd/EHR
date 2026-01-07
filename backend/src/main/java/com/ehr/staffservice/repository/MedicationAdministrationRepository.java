package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.MedicationAdministration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MedicationAdministrationRepository extends JpaRepository<MedicationAdministration, Long> {
    
    List<MedicationAdministration> findByPatientIdOrderByScheduledTimeDesc(Long patientId);
    
    List<MedicationAdministration> findByMedicationIdOrderByScheduledTimeDesc(Long medicationId);
    
    @Query("SELECT ma FROM MedicationAdministration ma WHERE ma.patientId = :patientId AND ma.scheduledTime BETWEEN :startDate AND :endDate ORDER BY ma.scheduledTime DESC")
    List<MedicationAdministration> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                                 @Param("startDate") LocalDateTime startDate, 
                                                                 @Param("endDate") LocalDateTime endDate);
    
    List<MedicationAdministration> findByStatusOrderByScheduledTimeAsc(String status);
    
    List<MedicationAdministration> findByPatientIdAndStatusOrderByScheduledTimeAsc(Long patientId, String status);
}

