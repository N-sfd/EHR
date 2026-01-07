package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MedicationRepository extends JpaRepository<Medication, Long> {
    
    List<Medication> findByPatientIdAndStatusOrderByStartDateDesc(Long patientId, String status);
    
    List<Medication> findByPatientIdOrderByStartDateDesc(Long patientId);
    
    List<Medication> findByStatusOrderByStartDateDesc(String status);
}

