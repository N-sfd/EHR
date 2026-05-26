package com.ehr.staffservice.ai.service;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiGuardrailService {

    public enum SymptomTriage {
        NONE,
        /** Same handling as legacy emergency keywords — immediate escalation copy. */
        EMERGENCY,
        /** Non-immediate but should encourage clinical follow-up. */
        CLINIC_REVIEW
    }

    @Value("${app.ai.emergency-keywords:chest pain,trouble breathing,suicidal,stroke,heavy bleeding}")
    private String emergencyKeywordsRaw;

    @Value("${app.ai.symptom-review-keywords:blood in stool,unexplained weight loss,persistent fever,night sweats,vision loss,weakness on one side}")
    private String symptomReviewKeywordsRaw;

    private List<String> emergencyTerms;
    private List<String> symptomReviewTerms;

    @PostConstruct
    void initKeywordLists() {
        emergencyTerms = splitCsv(emergencyKeywordsRaw);
        symptomReviewTerms = splitCsv(symptomReviewKeywordsRaw);
    }

    private static List<String> splitCsv(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of();
        }
        return Arrays.stream(raw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public boolean isEmergencyPrompt(String message) {
        return triage(message) == SymptomTriage.EMERGENCY;
    }

    public SymptomTriage triage(String message) {
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);
        if (emergencyTerms.stream().map(s -> s.toLowerCase(Locale.ROOT)).anyMatch(normalized::contains)) {
            return SymptomTriage.EMERGENCY;
        }
        if (symptomReviewTerms.stream()
                .map(s -> s.toLowerCase(Locale.ROOT))
                .anyMatch(normalized::contains)) {
            return SymptomTriage.CLINIC_REVIEW;
        }
        return SymptomTriage.NONE;
    }

    public boolean isPromptInjectionAttempt(String message) {
        String normalized = message == null ? "" : message.toLowerCase(Locale.ROOT);
        return normalized.contains("ignore previous instructions")
                || normalized.contains("show system prompt")
                || normalized.contains("dump database")
                || normalized.contains("reveal hidden policy");
    }
}
