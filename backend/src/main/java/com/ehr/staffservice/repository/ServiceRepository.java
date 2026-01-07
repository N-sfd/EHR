package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {

    List<Service> findByDepartmentId(Long departmentId);

    List<Service> findByStatus(String status);

    @Query("SELECT s FROM Service s WHERE s.status = :status AND s.departmentId = :departmentId")
    List<Service> findByStatusAndDepartmentId(String status, Long departmentId);

    @Query("SELECT s FROM Service s WHERE s.serviceName LIKE CONCAT('%', :name, '%')")
    List<Service> findByServiceNameContaining(@Param("name") String name);
}

