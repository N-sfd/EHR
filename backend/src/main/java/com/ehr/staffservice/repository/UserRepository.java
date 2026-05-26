package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByPatientId(Long patientId);
    Optional<User> findByStaffId(Long staffId);
}

