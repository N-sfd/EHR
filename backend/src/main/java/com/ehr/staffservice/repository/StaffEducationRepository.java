package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.StaffEducation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StaffEducationRepository extends JpaRepository<StaffEducation, UUID> {
    List<StaffEducation> findByStaffId(UUID staffId);
}
