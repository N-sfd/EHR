package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department WHERE a.appointmentCode = :appointmentCode")
    Optional<Appointment> findByAppointmentCode(@Param("appointmentCode") String appointmentCode);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department WHERE a.doctorId = :doctorId")
    List<Appointment> findByDoctorId(@Param("doctorId") Long doctorId);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department WHERE a.patientId = :patientId")
    List<Appointment> findByPatientId(@Param("patientId") Long patientId);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department WHERE a.departmentId = :departmentId")
    List<Appointment> findByDepartmentId(@Param("departmentId") Long departmentId);

    List<Appointment> findByAppointmentDate(LocalDate date);

    List<Appointment> findByAppointmentDateBetween(LocalDate startDate, LocalDate endDate);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.doctorId = :doctorId AND a.appointmentDate >= :startDate AND a.appointmentDate <= :endDate")
    List<Appointment> findByDoctorIdAndDateRange(@Param("doctorId") Long doctorId, 
                                                   @Param("startDate") LocalDate startDate, 
                                                   @Param("endDate") LocalDate endDate);

    List<Appointment> findByStatus(String status);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department WHERE a.appointmentDate >= :startDate AND a.appointmentDate <= :endDate ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findByDateRange(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department")
    @Override
    List<Appointment> findAll();

    // Calendar view queries
    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department " +
           "WHERE a.doctorId = :doctorId AND a.appointmentDate >= :startDate AND a.appointmentDate <= :endDate " +
           "ORDER BY a.appointmentDate, a.appointmentTime")
    List<Appointment> findByDoctorAndDateRange(@Param("doctorId") Long doctorId, 
                                               @Param("startDate") LocalDate startDate, 
                                               @Param("endDate") LocalDate endDate);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department " +
           "WHERE a.appointmentDate = :date AND a.appointmentTime >= :startTime AND a.appointmentTime < :endTime " +
           "ORDER BY a.appointmentTime")
    List<Appointment> findByDateAndTimeRange(@Param("date") LocalDate date,
                                              @Param("startTime") java.time.LocalTime startTime,
                                              @Param("endTime") java.time.LocalTime endTime);

    @Query("SELECT a FROM Appointment a LEFT JOIN FETCH a.doctor LEFT JOIN FETCH a.patient LEFT JOIN FETCH a.department " +
           "WHERE a.doctorId = :doctorId AND a.appointmentDate = :date " +
           "AND ((a.appointmentTime <= :startTime AND (a.endTime IS NULL OR a.endTime > :startTime)) " +
           "OR (a.appointmentTime < :endTime AND (a.endTime IS NULL OR a.endTime >= :endTime)) " +
           "OR (a.appointmentTime >= :startTime AND (a.endTime IS NULL OR a.endTime <= :endTime)))")
    List<Appointment> findConflictingAppointments(@Param("doctorId") Long doctorId,
                                                   @Param("date") LocalDate date,
                                                   @Param("startTime") java.time.LocalTime startTime,
                                                   @Param("endTime") java.time.LocalTime endTime);
}
