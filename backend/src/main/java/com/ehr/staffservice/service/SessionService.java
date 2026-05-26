package com.ehr.staffservice.service;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Server-side session storage for APP_SESSION cookies.
 * In production, use Redis or database with TTL.
 */
@Service
public class SessionService {

    private static final long SESSION_TTL_SECONDS = 3600; // 1 hour
    private final Map<String, SessionData> sessionStore = new ConcurrentHashMap<>();

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @Data
    public static class SessionData {
        private Long userId;
        private String username;
        private String role;
        private Long patientId;
        private Long staffId;
        private Instant expiresAt;

        public SessionData(Long userId, String username, String role, Long patientId, Long staffId) {
            this.userId = userId;
            this.username = username;
            this.role = role;
            this.patientId = patientId;
            this.staffId = staffId;
            this.expiresAt = Instant.now().plusSeconds(SESSION_TTL_SECONDS);
        }

        public boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }

        public long getRemainingSeconds() {
            long remaining = Instant.now().until(expiresAt, java.time.temporal.ChronoUnit.SECONDS);
            return remaining > 0 ? remaining : 0;
        }
    }

    public String createSession(Long userId, String username, String role, Long patientId, Long staffId) {
        cleanupExpiredSessions();
        String sessionId = UUID.randomUUID().toString();
        SessionData sessionData = new SessionData(userId, username, role, patientId, staffId);
        sessionStore.put(sessionId, sessionData);
        return sessionId;
    }

    public SessionData getSession(String sessionId) {
        if (sessionId == null) {
            return null;
        }
        SessionData session = sessionStore.get(sessionId);
        if (session == null || session.isExpired()) {
            if (session != null) {
                sessionStore.remove(sessionId);
            }
            return null;
        }
        return session;
    }

    public void deleteSession(String sessionId) {
        sessionStore.remove(sessionId);
    }

    private void cleanupExpiredSessions() {
        sessionStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

    public boolean isCookieSecure() {
        return cookieSecure;
    }
}

