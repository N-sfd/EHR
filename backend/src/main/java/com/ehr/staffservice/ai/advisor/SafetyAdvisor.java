package com.ehr.staffservice.ai.advisor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class SafetyAdvisor {
    // TODO: Wire Spring AI Advisors for centralized content and safety controls.
}
