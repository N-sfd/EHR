package com.ehr.staffservice.ai.service;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Lightweight numeric grounding check: flags answers that cite several multi-digit numbers absent from approved context.
 * Not a substitute for clinician review; reduces obvious numeric hallucinations.
 */
@Component
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiHallucinationHeuristic {

    private static final Pattern NUMERIC_TOKEN = Pattern.compile("\\b\\d{2,5}\\b");

    public boolean likelyUnsupportedNumericClaims(String answer, String groundingLowerCase) {
        if (answer == null || answer.isBlank() || groundingLowerCase == null || groundingLowerCase.isBlank()) {
            return false;
        }
        String ground = groundingLowerCase;
        Matcher m = NUMERIC_TOKEN.matcher(answer);
        int suspicious = 0;
        while (m.find()) {
            String num = m.group();
            if (!ground.contains(num.toLowerCase(Locale.ROOT))) {
                suspicious++;
            }
        }
        return suspicious >= 2;
    }
}
