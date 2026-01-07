package com.ehr.staffservice.repository.scheduling;

import com.ehr.staffservice.entity.scheduling.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    List<Provider> findByIsActiveTrue();
    List<Provider> findByDepartmentId(Long departmentId);
}

