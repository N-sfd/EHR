package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.PatientMedication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PatientMedicationRepository extends JpaRepository<PatientMedication, Long> {
    List<PatientMedication> findByPatient_PatientIdOrderByPrescribedDateDesc(Long patientId);
    List<PatientMedication> findByPatient_PatientIdAndIsActiveOrderByPrescribedDateDesc(Long patientId, Boolean isActive);
}

