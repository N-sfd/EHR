package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ImagingStudy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ImagingStudyRepository extends JpaRepository<ImagingStudy, Long> {
    
    Optional<ImagingStudy> findByStudyNumber(String studyNumber);
    
    List<ImagingStudy> findByPatientIdOrderByScheduledDateTimeDesc(Long patientId);
    
    List<ImagingStudy> findByPatientIdAndStatusOrderByScheduledDateTimeDesc(Long patientId, String status);
    
    List<ImagingStudy> findByStudyTypeOrderByScheduledDateTimeDesc(String studyType);
    
    @Query("SELECT is FROM ImagingStudy is WHERE is.patientId = :patientId AND is.scheduledDateTime BETWEEN :startDate AND :endDate ORDER BY is.scheduledDateTime DESC")
    List<ImagingStudy> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                     @Param("startDate") LocalDateTime startDate, 
                                                     @Param("endDate") LocalDateTime endDate);
    
    List<ImagingStudy> findByStatusOrderByScheduledDateTimeAsc(String status);
    
    List<ImagingStudy> findByIsPreliminaryOrderByCompletedDateTimeDesc(Boolean isPreliminary);
}

