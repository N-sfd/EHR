package com.ehr.staffservice.ai.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Entity
@Table(name = "ai_audit_log")
public class AiAuditLog {
    @Id
    private UUID id;

    @Column(name = "session_id")
    private UUID sessionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "patient_id")
    private Long patientId;

    @Column(name = "request_type", nullable = false, length = 64)
    private String requestType;

    @Column(name = "request_json", columnDefinition = "jsonb")
    private String requestJson;

    @Column(name = "response_json", columnDefinition = "jsonb")
    private String responseJson;

    @Column(name = "allowed_context_json", columnDefinition = "jsonb")
    private String allowedContextJson;

    @Column(nullable = false)
    private Boolean blocked = false;

    @Column(name = "blocked_reason")
    private String blockedReason;

    @Column(name = "latency_ms")
    private Long latencyMs;

    @Column(nullable = false)
    private Boolean success = true;

    @Column(name = "error_message", length = 512)
    private String errorMessage;

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;
}
