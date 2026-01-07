package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Immunization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ImmunizationRepository extends JpaRepository<Immunization, Long> {
    
    List<Immunization> findByPatientId(Long patientId);
    
    List<Immunization> findByPatientIdAndStatus(Long patientId, Immunization.ImmunizationStatus status);
    
    List<Immunization> findByVaccineName(String vaccineName);
    
    List<Immunization> findByCvxCode(String cvxCode);
    
    @Query("SELECT i FROM Immunization i WHERE i.patientId = :patientId AND i.administrationDate >= :startDate AND i.administrationDate <= :endDate")
    List<Immunization> findByPatientIdAndDateRange(@Param("patientId") Long patientId, 
                                                     @Param("startDate") LocalDate startDate, 
                                                     @Param("endDate") LocalDate endDate);
    
    @Query("SELECT i FROM Immunization i WHERE i.patientId = :patientId AND i.vaccineName = :vaccineName ORDER BY i.administrationDate DESC")
    List<Immunization> findByPatientIdAndVaccineName(@Param("patientId") Long patientId, 
                                                       @Param("vaccineName") String vaccineName);
}

