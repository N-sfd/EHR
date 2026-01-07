package com.ehr.staffservice.repository.ambulatory;

import com.ehr.staffservice.entity.ambulatory.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AmbulatoryEncounterRepository extends JpaRepository<Encounter, Long> {
    List<Encounter> findByPatientId(Long patientId);
    Optional<Encounter> findByAppointmentId(Long appointmentId);
}

