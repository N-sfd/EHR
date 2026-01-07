package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Procedure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ProcedureRepository extends JpaRepository<Procedure, Long> {
    
    List<Procedure> findByPatientId(Long patientId);
    
    List<Procedure> findByPatientIdAndStatus(Long patientId, Procedure.ProcedureStatus status);
    
    List<Procedure> findByCptCode(String cptCode);
    
    @Query("SELECT p FROM Procedure p WHERE p.patientId = :patientId AND p.procedureDate >= :startDate AND p.procedureDate <= :endDate")
    List<Procedure> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                 @Param("startDate") LocalDate startDate, 
                                                 @Param("endDate") LocalDate endDate);
    
    @Query("SELECT p FROM Procedure p WHERE p.performedByStaffId = :staffId AND p.procedureDate >= :startDate")
    List<Procedure> findByPerformedByStaffIdAndDateRange(@Param("staffId") Long staffId, 
                                                          @Param("startDate") LocalDate startDate);
}

