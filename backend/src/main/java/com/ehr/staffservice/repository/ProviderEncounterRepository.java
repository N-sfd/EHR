package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ProviderEncounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderEncounterRepository extends JpaRepository<ProviderEncounter, Long> {
    Optional<ProviderEncounter> findByEncounterId(Long encounterId);
    Optional<ProviderEncounter> findByAppointmentId(Long appointmentId);
    List<ProviderEncounter> findByPatientId(Long patientId);
    List<ProviderEncounter> findByProviderId(Long providerId);
}

