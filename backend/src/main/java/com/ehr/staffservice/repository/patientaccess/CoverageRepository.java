package com.ehr.staffservice.repository.patientaccess;

import com.ehr.staffservice.entity.patientaccess.Coverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CoverageRepository extends JpaRepository<Coverage, Long> {
    List<Coverage> findByPatientId(Long patientId);
    Optional<Coverage> findByPatientIdAndIsPrimaryTrue(Long patientId);
}

