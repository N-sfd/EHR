package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}

