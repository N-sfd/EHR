package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    boolean existsByDoctorCode(String doctorCode);
    
    @Query("SELECT MAX(d.doctorCode) FROM Doctor d WHERE d.doctorCode LIKE 'D-%'")
    Optional<String> findMaxDoctorCode();
    
    Optional<Doctor> findByStaffStaffId(Long staffId);
}

