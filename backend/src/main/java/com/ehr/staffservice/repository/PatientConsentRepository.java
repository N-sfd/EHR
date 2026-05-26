package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.PatientConsent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientConsentRepository extends JpaRepository<PatientConsent, Long> {
    List<PatientConsent> findByPatientId(Long patientId);
    List<PatientConsent> findByPatientIdAndConsentSigned(Long patientId, Boolean consentSigned);
    Optional<PatientConsent> findByPatientIdAndConsentType(Long patientId, String consentType);
    boolean existsByPatientIdAndConsentTypeAndConsentSigned(Long patientId, String consentType, Boolean consentSigned);
}

