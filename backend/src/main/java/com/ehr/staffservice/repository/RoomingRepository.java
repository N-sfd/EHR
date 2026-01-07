package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Rooming;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomingRepository extends JpaRepository<Rooming, Long> {
    Optional<Rooming> findByEncounterId(Long encounterId);
    Optional<Rooming> findByAppointmentId(Long appointmentId);
    List<Rooming> findByPatientId(Long patientId);
}

