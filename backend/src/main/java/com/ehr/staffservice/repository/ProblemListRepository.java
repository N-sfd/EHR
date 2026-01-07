package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ProblemList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemListRepository extends JpaRepository<ProblemList, Long> {
    
    List<ProblemList> findByPatientId(Long patientId);
    
    List<ProblemList> findByPatientIdAndStatus(Long patientId, ProblemList.ProblemStatus status);
    
    List<ProblemList> findByPatientIdAndActive(Long patientId, Boolean active);
    
    @Query("SELECT p FROM ProblemList p WHERE p.patientId = :patientId AND p.status = 'ACTIVE'")
    List<ProblemList> findActiveProblemsByPatientId(@Param("patientId") Long patientId);
    
    List<ProblemList> findByStatus(ProblemList.ProblemStatus status);
}

