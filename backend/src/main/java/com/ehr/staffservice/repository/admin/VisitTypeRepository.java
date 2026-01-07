package com.ehr.staffservice.repository.admin;

import com.ehr.staffservice.entity.admin.VisitType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitTypeRepository extends JpaRepository<VisitType, Long> {
    List<VisitType> findByIsActiveTrue();
}

