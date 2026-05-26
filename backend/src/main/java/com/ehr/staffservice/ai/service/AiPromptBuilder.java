package com.ehr.staffservice.ai.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiPromptBuilder {

    public String buildSystemPrompt(String role, String portal, List<String> contextSnippets) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are an AI medical assistant embedded inside an EHR. ")
                .append("Answer only from provided context. ")
                .append("Never invent diagnoses, labs, medications, or history. ")
                .append("If evidence is insufficient, say so clearly. ")
                .append("If symptoms may indicate emergency, instruct immediate emergency care. ")
                .append("Use plain language for patients and concise language for staff.\n\n")
                .append("ROLE: ").append(role).append("\n")
                .append("PORTAL: ").append(portal).append("\n")
                .append("APPROVED CONTEXT:\n");

        for (String snippet : contextSnippets) {
            sb.append("- ").append(snippet).append("\n");
        }
        return sb.toString();
    }
}
