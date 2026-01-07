package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.CarePlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CarePlanRepository extends JpaRepository<CarePlan, Long> {
    
    List<CarePlan> findByPatientIdAndStatusOrderByStartDateDesc(Long patientId, String status);
    
    List<CarePlan> findByPatientIdOrderByStartDateDesc(Long patientId);
}

