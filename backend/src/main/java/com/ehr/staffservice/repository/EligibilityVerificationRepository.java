package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.EligibilityVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface EligibilityVerificationRepository extends JpaRepository<EligibilityVerification, Long> {
    List<EligibilityVerification> findByPatientId(Long patientId);
    List<EligibilityVerification> findByInsuranceId(Long insuranceId);
    List<EligibilityVerification> findByPatientIdAndInsuranceId(Long patientId, Long insuranceId);
    
    @Query("SELECT e FROM EligibilityVerification e WHERE e.patientId = :patientId AND e.insuranceId = :insuranceId AND e.eligibilityStatus = 'ELIGIBLE' ORDER BY e.verificationDate DESC")
    Optional<EligibilityVerification> findLatestEligibleVerification(@Param("patientId") Long patientId, @Param("insuranceId") Long insuranceId);
    
    @Query("SELECT e FROM EligibilityVerification e WHERE e.patientId = :patientId AND e.eligibilityStatus = 'ELIGIBLE' AND (e.expirationDate IS NULL OR e.expirationDate > :now)")
    List<EligibilityVerification> findActiveEligibilityByPatientId(@Param("patientId") Long patientId, @Param("now") LocalDateTime now);
}

