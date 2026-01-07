package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByStaffCode(String staffCode);
    
    @Query("SELECT MAX(s.staffCode) FROM Staff s WHERE s.staffCode LIKE 'S-%'")
    Optional<String> findMaxStaffCode();
}
