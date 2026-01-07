package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.StaffCertification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StaffCertificationRepository extends JpaRepository<StaffCertification, UUID> {
    List<StaffCertification> findByStaffId(UUID staffId);
}
