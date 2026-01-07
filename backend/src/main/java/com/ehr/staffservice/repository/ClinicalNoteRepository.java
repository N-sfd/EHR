package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ClinicalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ClinicalNoteRepository extends JpaRepository<ClinicalNote, Long> {
    
    List<ClinicalNote> findByPatientIdOrderByNoteDateTimeDesc(Long patientId);
    
    List<ClinicalNote> findByPatientIdAndNoteTypeOrderByNoteDateTimeDesc(Long patientId, String noteType);
    
    @Query("SELECT n FROM ClinicalNote n WHERE n.patientId = :patientId AND n.noteDateTime BETWEEN :startDate AND :endDate ORDER BY n.noteDateTime DESC")
    List<ClinicalNote> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                    @Param("startDate") LocalDateTime startDate, 
                                                    @Param("endDate") LocalDateTime endDate);
    
    List<ClinicalNote> findByAuthorStaffIdOrderByNoteDateTimeDesc(Long staffId);
}

