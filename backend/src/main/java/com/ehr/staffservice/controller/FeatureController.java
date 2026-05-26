package com.ehr.staffservice.controller;

import com.ehr.staffservice.config.AiProperties;
import com.ehr.staffservice.dto.FeatureFlagsResponse;
import lombok.RequiredArgsConstructor;
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

    @GetMapping
    public FeatureFlagsResponse getFeatures() {
        return new FeatureFlagsResponse(
                aiProperties.isEnabled(),
                aiProperties.isAuditEnabled(),
                aiProperties.isAllowStreaming()
        );
    }
}
