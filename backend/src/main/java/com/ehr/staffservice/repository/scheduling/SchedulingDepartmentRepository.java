package com.ehr.staffservice.repository.scheduling;

import com.ehr.staffservice.entity.scheduling.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SchedulingDepartmentRepository extends JpaRepository<Department, Long> {
    List<Department> findByIsActiveTrue();
}

