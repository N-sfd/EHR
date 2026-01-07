package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Designation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DesignationRepository extends JpaRepository<Designation, Long> {
}

