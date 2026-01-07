package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.PatientContact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientContactRepository extends JpaRepository<PatientContact, Long> {
    List<PatientContact> findByPatientId(Long patientId);
    List<PatientContact> findByPatientIdAndContactType(Long patientId, PatientContact.ContactType contactType);
    List<PatientContact> findByPatientIdAndIsEmergencyContact(Long patientId, Boolean isEmergencyContact);
    List<PatientContact> findByPatientIdAndIsPrimary(Long patientId, Boolean isPrimary);
}

