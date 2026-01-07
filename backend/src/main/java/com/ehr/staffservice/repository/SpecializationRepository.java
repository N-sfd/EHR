package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SpecializationRepository extends JpaRepository<Specialization, Long> {
}

