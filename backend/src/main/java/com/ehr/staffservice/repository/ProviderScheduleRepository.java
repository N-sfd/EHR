package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ProviderSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProviderScheduleRepository extends JpaRepository<ProviderSchedule, Long> {
    List<ProviderSchedule> findByProviderId(Long providerId);
    List<ProviderSchedule> findByProviderIdAndScheduleDate(Long providerId, LocalDate scheduleDate);
    
    @Query("SELECT ps FROM ProviderSchedule ps WHERE ps.providerId = :providerId AND ps.scheduleDate >= :startDate AND ps.scheduleDate <= :endDate AND ps.isAvailable = true")
    List<ProviderSchedule> findAvailableSchedulesByProviderAndDateRange(@Param("providerId") Long providerId, 
                                                                        @Param("startDate") LocalDate startDate, 
                                                                        @Param("endDate") LocalDate endDate);
}

