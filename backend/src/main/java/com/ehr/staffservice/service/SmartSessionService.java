package com.ehr.staffservice.service;

import lombok.Data;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Service to manage SMART_SESSION tokens.
 * Provides access to token store for authentication filters.
 */
@Service
public class SmartSessionService {

    // In-memory token storage (key: sessionId, value: token data with expiry)
    // In production, use Redis or database with TTL
    private static final Map<String, TokenData> tokenStore = new ConcurrentHashMap<>();
    private static final long TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

    @Data
    public static class TokenData {
        private String accessToken;
        private Instant expiresAt;
        private Long patientId; // Extracted from token or set during callback
        private String patientName; // Extracted from token or set during callback

        public TokenData(String accessToken) {
            this(accessToken, TOKEN_EXPIRY_SECONDS);
        }

        public TokenData(String accessToken, long expiresInSeconds) {
            this.accessToken = accessToken;
            long ttl = expiresInSeconds > 0 ? expiresInSeconds : TOKEN_EXPIRY_SECONDS;
            this.expiresAt = Instant.now().plusSeconds(ttl);
            // TODO: In production, extract patientId and patientName from token
            // For now, use stub values
            this.patientId = 1L;
            this.patientName = "Patient User";
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }

        public long getRemainingSeconds() {
            long remaining = Instant.now().until(expiresAt, java.time.temporal.ChronoUnit.SECONDS);
            return remaining > 0 ? remaining : 0;
        }
    }

    public void storeToken(String sessionId, TokenData tokenData) {
        cleanupExpiredTokens();
        tokenStore.put(sessionId, tokenData);
    }

    public TokenData getToken(String sessionId) {
        if (sessionId == null) {
            return null;
        }
        TokenData token = tokenStore.get(sessionId);
        if (token == null || token.isExpired()) {
            if (token != null) {
                tokenStore.remove(sessionId);
            }
            return null;
        }
        return token;
    }

    public void deleteToken(String sessionId) {
        tokenStore.remove(sessionId);
    }

    private void cleanupExpiredTokens() {
        tokenStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

    // Package-private accessor for PatientSmartController to use the same store
    Map<String, TokenData> getTokenStore() {
        return tokenStore;
    }
}

