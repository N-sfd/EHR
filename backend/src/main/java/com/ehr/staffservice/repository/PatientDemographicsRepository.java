package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.PatientDemographics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientDemographicsRepository extends JpaRepository<PatientDemographics, Long> {
    Optional<PatientDemographics> findByPatientId(Long patientId);
    Optional<PatientDemographics> findByMedicalRecordNumber(String medicalRecordNumber);
}

