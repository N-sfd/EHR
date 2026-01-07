package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Insurance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InsuranceRepository extends JpaRepository<Insurance, Long> {
    List<Insurance> findByPatientId(Long patientId);
    List<Insurance> findByPatientIdAndIsActive(Long patientId, Boolean isActive);
    List<Insurance> findByPatientIdAndIsPrimary(Long patientId, Boolean isPrimary);
    Optional<Insurance> findByPatientIdAndIsPrimaryTrue(Long patientId);
    List<Insurance> findByPatientIdAndInsuranceType(Long patientId, Insurance.InsuranceType insuranceType);
}

