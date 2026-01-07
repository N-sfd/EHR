package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Checkout;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CheckoutRepository extends JpaRepository<Checkout, Long> {
    Optional<Checkout> findByEncounterId(Long encounterId);
    Optional<Checkout> findByAppointmentId(Long appointmentId);
    List<Checkout> findByPatientId(Long patientId);
}

