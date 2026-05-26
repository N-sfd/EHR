package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    /**
     * Find appointments by date range and optional provider/room filter
     * Used for grid queries (lightweight)
     */
    @Query("SELECT a FROM Appointment a " +
           "WHERE a.startAt >= :startAt AND a.startAt < :endAt " +
           "AND (:doctorIds IS NULL OR a.doctorId IN :doctorIds) " +
           "AND (:roomIds IS NULL OR a.roomId IN :roomIds) " +
           "ORDER BY a.startAt")
    List<Appointment> findByDateRange(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds,
            @Param("roomIds") List<Long> roomIds);

    /**
     * Find conflicting appointments for a doctor
     * Used for conflict validation
     */
    @Query("SELECT a FROM Appointment a " +
           "WHERE a.doctorId = :doctorId " +
           "AND (:excludeId IS NULL OR a.id != :excludeId) " +
           "AND a.status != 'CANCELLED' " +
           "AND (a.startAt < :endAt AND a.endAt > :startAt)")
    List<Appointment> findConflictingAppointments(
            @Param("doctorId") Long doctorId,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("excludeId") Long excludeId);

    /**
     * Find appointments by patient
     */
    List<Appointment> findByPatientIdOrderByStartAtDesc(Long patientId);

    /**
     * Find appointments by doctor
     */
    List<Appointment> findByDoctorIdOrderByStartAtDesc(Long doctorId);

    // ============================================================================
    // REPORTING QUERIES (Aggregation)
    // ============================================================================

    /**
     * Count total appointments in date range
     */
    @Query("SELECT COUNT(a) FROM Appointment a " +
           "WHERE a.startAt >= :startAt AND a.startAt < :endAt " +
           "AND (:doctorIds IS NULL OR a.doctorId IN :doctorIds)")
    Long countByDateRange(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds);

    /**
     * Count urgent appointments in date range
     */
    @Query("SELECT COUNT(a) FROM Appointment a " +
           "WHERE a.startAt >= :startAt AND a.startAt < :endAt " +
           "AND a.priority = 'URGENT' " +
           "AND (:doctorIds IS NULL OR a.doctorId IN :doctorIds)")
    Long countUrgentByDateRange(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds);

    /**
     * Count appointments by status in date range
     * Returns Object[] where [0] = status, [1] = count
     */
    @Query("SELECT a.status, COUNT(a) FROM Appointment a " +
           "WHERE a.startAt >= :startAt AND a.startAt < :endAt " +
           "AND (:doctorIds IS NULL OR a.doctorId IN :doctorIds) " +
           "GROUP BY a.status")
    List<Object[]> countByStatusAndDateRange(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds);

    /**
     * Count appointments by day in date range
     * Returns Object[] where [0] = date (LocalDate), [1] = count
     * Uses FUNCTION for date extraction (Hibernate-compatible)
     */
    @Query(value = "SELECT DATE(a.start_datetime) as date, COUNT(a.id) as count " +
           "FROM appointment a " +
           "WHERE a.start_datetime >= :startAt AND a.start_datetime < :endAt " +
           "AND (:doctorIds IS NULL OR a.doctor_id IN :doctorIds) " +
           "GROUP BY DATE(a.start_datetime) " +
           "ORDER BY DATE(a.start_datetime)", nativeQuery = true)
    List<Object[]> countByDayAndDateRange(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds);

    /**
     * Provider utilization aggregation
     * Returns Object[] where [0] = doctorId, [1] = totalAppointments, [2] = totalMinutes
     */
    @Query("SELECT a.doctorId, COUNT(a), COALESCE(SUM(a.durationMinutes), 0) " +
           "FROM Appointment a " +
           "WHERE a.startAt >= :startAt AND a.startAt < :endAt " +
           "AND (:doctorIds IS NULL OR a.doctorId IN :doctorIds) " +
           "GROUP BY a.doctorId " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> getProviderUtilization(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds);

    /**
     * Heatmap aggregation: Count appointments by day of week and hour
     * Returns Object[] where [0] = dayOfWeek (0-6), [1] = hour (0-23), [2] = count
     * Uses PostgreSQL EXTRACT function: DOW returns 0=Sunday, 1=Monday, etc.
     */
    @Query(value = "SELECT " +
           "EXTRACT(DOW FROM a.start_datetime)::integer as dayOfWeek, " +
           "EXTRACT(HOUR FROM a.start_datetime)::integer as hour, " +
           "COUNT(a.id) as count " +
           "FROM appointment a " +
           "WHERE a.start_datetime >= :startAt AND a.start_datetime < :endAt " +
           "AND (:doctorIds IS NULL OR a.doctor_id IN (:doctorIds)) " +
           "AND EXTRACT(HOUR FROM a.start_datetime) >= 7 AND EXTRACT(HOUR FROM a.start_datetime) <= 19 " +
           "GROUP BY EXTRACT(DOW FROM a.start_datetime), EXTRACT(HOUR FROM a.start_datetime) " +
           "ORDER BY dayOfWeek, hour", nativeQuery = true)
    List<Object[]> getHeatmapBuckets(
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("doctorIds") List<Long> doctorIds);
}

