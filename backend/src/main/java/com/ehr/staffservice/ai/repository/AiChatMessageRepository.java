package com.ehr.staffservice.ai.repository;

import com.ehr.staffservice.ai.model.AiChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AiChatMessageRepository extends JpaRepository<AiChatMessage, UUID> {
    List<AiChatMessage> findBySession_IdOrderByCreatedAtAsc(UUID sessionId);
}
