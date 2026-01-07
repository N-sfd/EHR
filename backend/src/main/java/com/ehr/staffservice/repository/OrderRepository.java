package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Optional<Order> findByOrderNumber(String orderNumber);
    
    List<Order> findByPatientIdOrderByStartDateTimeDesc(Long patientId);
    
    List<Order> findByPatientIdAndStatusOrderByStartDateTimeDesc(Long patientId, String status);
    
    List<Order> findByOrderTypeAndStatusOrderByStartDateTimeDesc(String orderType, String status);
    
    @Query("SELECT o FROM Order o WHERE o.patientId = :patientId AND o.startDateTime BETWEEN :startDate AND :endDate ORDER BY o.startDateTime DESC")
    List<Order> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                              @Param("startDate") LocalDateTime startDate, 
                                              @Param("endDate") LocalDateTime endDate);
    
    List<Order> findByStatusOrderByStartDateTimeAsc(String status);
}

