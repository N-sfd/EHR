package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByPatientCode(String patientCode);
    Optional<Patient> findByEmail(String email);
    Optional<Patient> findByPhoneNumber(String phoneNumber);
}

