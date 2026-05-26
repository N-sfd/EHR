package com.ehr.staffservice.ai.repository;

import com.ehr.staffservice.ai.model.AiChatSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AiChatSessionRepository extends JpaRepository<AiChatSession, UUID> {
    Optional<AiChatSession> findByIdAndUserId(UUID id, Long userId);
}
