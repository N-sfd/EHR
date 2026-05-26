package com.ehr.staffservice.ai.repository;

import com.ehr.staffservice.ai.model.AiAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface AiAuditLogRepository extends JpaRepository<AiAuditLog, UUID> {
}
