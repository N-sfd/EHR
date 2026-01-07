package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(String name);
    boolean existsByName(String name);
    Optional<Role> findByCode(String code);
    boolean existsByCode(String code);
}

