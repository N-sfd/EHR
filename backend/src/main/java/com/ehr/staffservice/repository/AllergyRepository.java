package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Allergy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AllergyRepository extends JpaRepository<Allergy, Long> {
    
    List<Allergy> findByPatientIdAndStatusOrderByOnsetDateDesc(Long patientId, String status);
    
    List<Allergy> findByPatientIdOrderByOnsetDateDesc(Long patientId);
}

