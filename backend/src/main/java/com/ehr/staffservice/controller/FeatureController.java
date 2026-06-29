package com.ehr.staffservice.controller;

import com.ehr.staffservice.config.AiProperties;
import com.ehr.staffservice.config.EhrAiProperties;
import com.ehr.staffservice.dto.FeatureFlagsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public feature flags for SPA shells (admin / patient portal) to toggle UI without calling AI APIs.
 * Always registered — not conditional on {@code app.ai.enabled} — so clients can decide pre-login.
 */
@RestController
@RequestMapping("/api/features")
@RequiredArgsConstructor
public class FeatureController {

    private final AiProperties aiProperties;
    private final EhrAiProperties ehrAiProperties;

    @Value("${spring.ai.openai.chat.options.model:}")
    private String chatModel;

    @Value("${OLLAMA_BASE_URL:http://localhost:11434}")
    private String ollamaBaseUrl;

    @GetMapping
    public FeatureFlagsResponse getFeatures() {
        String provider = "none";
        if (aiProperties.isEnabled()) {
            provider = ehrAiProperties.isOllama() ? "ollama" : "openai";
        }
        String model = chatModel != null ? chatModel.trim() : "";
        String ollamaHost = ollamaBaseUrl != null ? ollamaBaseUrl.trim() : "http://localhost:11434";
        return new FeatureFlagsResponse(
                aiProperties.isEnabled(),
                aiProperties.isAuditEnabled(),
                aiProperties.isAllowStreaming(),
                ehrAiProperties.isOllama(),
                provider,
                model,
                ollamaHost
        );
    }
}
