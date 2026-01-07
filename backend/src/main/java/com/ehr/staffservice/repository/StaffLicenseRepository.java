package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.StaffLicense;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StaffLicenseRepository extends JpaRepository<StaffLicense, UUID> {
    List<StaffLicense> findByStaffId(UUID staffId);
}
