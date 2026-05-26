package com.ehr.staffservice.ai.repository;

import com.ehr.staffservice.ai.model.AiFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiFeedbackRepository extends JpaRepository<AiFeedback, UUID> {
}
