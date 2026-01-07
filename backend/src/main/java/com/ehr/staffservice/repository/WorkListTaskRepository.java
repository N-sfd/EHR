package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.WorkListTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WorkListTaskRepository extends JpaRepository<WorkListTask, Long> {
    
    List<WorkListTask> findByAssignedToStaffIdAndStatusOrderByDueDateTimeAsc(Long staffId, String status);
    
    List<WorkListTask> findByPatientIdOrderByDueDateTimeAsc(Long patientId);
    
    @Query("SELECT t FROM WorkListTask t WHERE t.assignedToStaffId = :staffId AND t.dueDateTime BETWEEN :startDate AND :endDate ORDER BY t.priority DESC, t.dueDateTime ASC")
    List<WorkListTask> findByStaffAndDateRange(@Param("staffId") Long staffId, 
                                                @Param("startDate") LocalDateTime startDate, 
                                                @Param("endDate") LocalDateTime endDate);
    
    List<WorkListTask> findByStatusOrderByDueDateTimeAsc(String status);
}

