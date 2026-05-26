package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.ai.model.AiAuditLog;
import com.ehr.staffservice.ai.repository.AiAuditLogRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiAuditService {
    private final AiAuditLogRepository auditLogRepository;
    private final ObjectMapper objectMapper;

    public AiAuditService(AiAuditLogRepository auditLogRepository, ObjectMapper objectMapper) {
        this.auditLogRepository = auditLogRepository;
        this.objectMapper = objectMapper;
    }

    public void log(Long userId, Long patientId, String requestType, Object request, Object response, boolean blocked,
                    String blockedReason, Long latencyMs, UUID sessionId) {
        log(userId, patientId, requestType, request, response, blocked, blockedReason, latencyMs, sessionId,
                null, null, null, true, null);
    }

    public void log(Long userId, Long patientId, String requestType, Object request, Object response, boolean blocked,
                    String blockedReason, Long latencyMs, UUID sessionId,
                    Integer promptTokens, Integer completionTokens, Integer totalTokens,
                    boolean success, String errorMessage) {
        AiAuditLog log = new AiAuditLog();
        log.setId(UUID.randomUUID());
        log.setUserId(userId == null ? 0L : userId);
        log.setPatientId(patientId);
        log.setRequestType(requestType);
        log.setBlocked(blocked);
        log.setBlockedReason(blockedReason);
        log.setLatencyMs(latencyMs);
        log.setSessionId(sessionId);
        log.setCreatedAt(Instant.now());
        log.setRequestJson(writeJson(request));
        log.setResponseJson(writeJson(response));
        log.setPromptTokens(promptTokens);
        log.setCompletionTokens(completionTokens);
        log.setTotalTokens(totalTokens);
        log.setSuccess(success);
        log.setErrorMessage(truncate(errorMessage, 512));
        auditLogRepository.save(log);
    }

    private static String truncate(String s, int max) {
        if (s == null) {
            return null;
        }
        return s.length() <= max ? s : s.substring(0, max);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception e) {
            return "{}";
        }
    }
}
