package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.PatientAddress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PatientAddressRepository extends JpaRepository<PatientAddress, Long> {
    List<PatientAddress> findByPatientId(Long patientId);
    List<PatientAddress> findByPatientIdAndAddressType(Long patientId, PatientAddress.AddressType addressType);
    List<PatientAddress> findByPatientIdAndIsPrimary(Long patientId, Boolean isPrimary);
    List<PatientAddress> findByPatientIdAndIsActive(Long patientId, Boolean isActive);
}

