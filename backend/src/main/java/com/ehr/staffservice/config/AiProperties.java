package com.ehr.staffservice.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Bound from {@code app.ai.*} in configuration (driven by {@code ehr.ai.enabled} / env flags).
 */
@Getter
@Setter
@ConfigurationProperties(prefix = "app.ai")
public class AiProperties {

    /**
     * When true, AI REST beans and OpenAI autoconfig are active (requires API key, etc.).
     */
    private boolean enabled = false;

    /**
     * When true, AI requests are written to {@code ai_audit_log} (when AI flows run).
     */
    private boolean auditEnabled = false;

    /**
     * When true, {@code POST /api/ai/chat/stream} (SSE) is available; frontends may prefer streaming then fall back to {@code /api/ai/chat}.
     */
    private boolean allowStreaming = false;
}
