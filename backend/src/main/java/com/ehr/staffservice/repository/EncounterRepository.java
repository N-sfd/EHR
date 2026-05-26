package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Encounter;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EncounterRepository extends JpaRepository<Encounter, Long> {
    Optional<Encounter> findByEncounterNumber(String encounterNumber);
    List<Encounter> findByPatientId(Long patientId);
    List<Encounter> findByPatientIdAndEncounterStatus(Long patientId, Encounter.EncounterStatus status);
    List<Encounter> findByAppointmentId(Long appointmentId);
    
    @Query("SELECT e FROM Encounter e WHERE e.patientId = :patientId AND e.checkInDateTime >= :startDate AND e.checkInDateTime <= :endDate")
    List<Encounter> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                 @Param("startDate") LocalDateTime startDate, 
                                                 @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT e FROM Encounter e WHERE e.encounterStatus = 'CHECKED_IN' AND e.checkInDateTime >= :startDate")
    List<Encounter> findActiveCheckIns(@Param("startDate") LocalDateTime startDate);

    @Query("SELECT e FROM Encounter e WHERE e.patientId = :patientId ORDER BY e.checkInDateTime DESC NULLS LAST, e.id DESC")
    List<Encounter> findRecentByPatientId(@Param("patientId") Long patientId, Pageable pageable);
}

