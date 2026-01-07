package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.StaffAward;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface StaffAwardRepository extends JpaRepository<StaffAward, UUID> {
    List<StaffAward> findByStaffId(UUID staffId);
}
