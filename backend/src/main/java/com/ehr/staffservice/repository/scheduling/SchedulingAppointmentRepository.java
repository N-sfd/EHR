package com.ehr.staffservice.repository.scheduling;

import com.ehr.staffservice.entity.scheduling.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface SchedulingAppointmentRepository extends JpaRepository<Appointment, Long> {
    List<Appointment> findByPatientId(Long patientId);
    
    @Query(value = "SELECT * FROM scheduling_appointments WHERE DATE(start_date_time) = :date", nativeQuery = true)
    List<Appointment> findByDate(@Param("date") LocalDate date);
    
    @Query(value = "SELECT * FROM scheduling_appointments WHERE DATE(start_date_time) = :date AND provider_id = :providerId", nativeQuery = true)
    List<Appointment> findByDateAndProvider(@Param("date") LocalDate date, @Param("providerId") Long providerId);
    
    @Query("SELECT a FROM SchedulingAppointment a WHERE a.providerId = :providerId AND " +
           "a.startDateTime BETWEEN :start AND :end AND " +
           "a.status != 'CANCELED'")
    List<Appointment> findConflictingAppointments(
        @Param("providerId") Long providerId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );
}

