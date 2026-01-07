package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.TreatmentTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentTeamRepository extends JpaRepository<TreatmentTeam, Long> {
    
    List<TreatmentTeam> findByPatientIdAndStatusOrderByIsPrimaryDesc(Long patientId, String status);
    
    List<TreatmentTeam> findByStaffIdAndStatus(Long staffId, String status);
    
    Optional<TreatmentTeam> findByPatientIdAndStaffIdAndStatus(Long patientId, Long staffId, String status);
}

