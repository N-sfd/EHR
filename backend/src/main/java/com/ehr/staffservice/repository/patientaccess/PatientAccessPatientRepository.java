package com.ehr.staffservice.repository.patientaccess;

import com.ehr.staffservice.entity.patientaccess.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PatientAccessPatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByMrn(String mrn);

    @Query("SELECT p FROM PatientAccessPatient p WHERE " +
           "LOWER(p.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.mrn) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.phone) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Patient> searchByQuery(@Param("query") String query);
}

