package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.RefillRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RefillRequestRepository extends JpaRepository<RefillRequest, Long> {
    List<RefillRequest> findByPatient_PatientIdOrderByRequestedAtDesc(Long patientId);
    List<RefillRequest> findByMedication_MedicationIdAndPatient_PatientId(Long medicationId, Long patientId);
}

