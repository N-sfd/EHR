package com.ehr.staffservice.controller;

import com.ehr.staffservice.service.SmartSessionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * SMART on FHIR patient authentication endpoints.
 * Handles Epic MyChart launch flow without storing tokens in frontend.
 * Implements PKCE (S256), state validation, and ISS allowlist.
 */
@RestController
@RequestMapping("/api/patient/smart")
@RequiredArgsConstructor
public class PatientSmartController {

    private final SmartSessionService smartSessionService;
    private static final long TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

    // State storage for OAuth flow (key: state, value: state data with expiry)
    private static final Map<String, StateData> stateStore = new ConcurrentHashMap<>();
    private static final long STATE_EXPIRY_SECONDS = 600; // 10 minutes

    private static final SecureRandom secureRandom = new SecureRandom();

    @Value("#{'${smart.epic.allowed-iss}'.split(',')}")
    private List<String> allowedIssList;

    @Value("${smart.epic.client-id}")
    private String clientId;

    @Value("${smart.epic.redirect-uri}")
    private String redirectUri;

    @Value("${smart.epic.scope}")
    private String scope;

    @Value("${smart.epic.cookie-secure:false}")
    private boolean cookieSecure;

    @Value("${smart.epic.frontend-base-url:http://localhost:4200}")
    private String frontendBaseUrl;


    @Data
    private static class StateData {
        private String iss;
        private String launch;
        private String codeVerifier;
        private Instant expiresAt;
        
        StateData(String iss, String launch, String codeVerifier) {
            this.iss = iss;
            this.launch = launch;
            this.codeVerifier = codeVerifier;
            this.expiresAt = Instant.now().plusSeconds(STATE_EXPIRY_SECONDS);
        }
        
        boolean isExpired() {
            return Instant.now().isAfter(expiresAt);
        }
    }

    /**
     * Generate high-entropy code verifier for PKCE.
     */
    private String generateCodeVerifier() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Generate code challenge from verifier using S256.
     */
    private String generateCodeChallenge(String codeVerifier) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(codeVerifier.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate code challenge", e);
        }
    }

    /**
     * Normalize ISS for comparison (trim whitespace, remove trailing slash).
     */
    private String normalizeIss(String iss) {
        if (iss == null) return null;
        String normalized = iss.trim();
        if (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    /**
     * Clean up expired entries from stateStore.
     * Token cleanup is handled by SmartSessionService.
     * Called periodically to prevent memory leaks.
     */
    private void cleanupExpiredEntries() {
        // Clean expired states
        stateStore.entrySet().removeIf(entry -> entry.getValue().isExpired());
    }

    /**
     * GET /api/patient/smart/launch?iss=...&launch=...
     * Creates state, stores temporary state server-side, redirects to Epic authorize URL.
     * 
     * NOTE: For cross-origin SPA deployments:
     * - Frontend must send requests with withCredentials: true
     * - Backend CORS config must allow credentials (allowCredentials: true)
     * - Cookie SameSite must be Lax or None (None requires Secure: true)
     */
    @GetMapping("/launch")
    public void launch(
            @RequestParam String iss,
            @RequestParam String launch,
            HttpServletResponse response) throws Exception {
        
        // Clean up expired entries
        cleanupExpiredEntries();
        
        // Normalize ISS for comparison
        String normalizedIss = normalizeIss(iss);
        if (normalizedIss == null || normalizedIss.isEmpty()) {
            redirectToLaunchWithError(response, "ISS parameter is required and cannot be empty");
            return;
        }
        
        // Normalize allowlist for comparison
        List<String> normalizedAllowedIss = allowedIssList.stream()
            .map(this::normalizeIss)
            .filter(normalized -> normalized != null && !normalized.isEmpty())
            .collect(Collectors.toList());
        
        // Validate ISS against allowlist
        if (!normalizedAllowedIss.contains(normalizedIss)) {
            redirectToLaunchWithError(response, "Invalid ISS. Not in allowed list.");
            return;
        }
        
        // Use normalized ISS for storage and URL building
        String effectiveIss = normalizedIss;
        
        // Generate state and PKCE parameters
        String state = UUID.randomUUID().toString();
        String codeVerifier = generateCodeVerifier();
        String codeChallenge = generateCodeChallenge(codeVerifier);
        
        // Store state with code verifier and metadata (use normalized ISS)
        stateStore.put(state, new StateData(effectiveIss, launch, codeVerifier));
        
        // Build Epic authorization URL with all required parameters
        String authorizeUrl = String.format(
            "%s/oauth2/authorize?response_type=code&client_id=%s&redirect_uri=%s&scope=%s&state=%s&launch=%s&aud=%s&code_challenge=%s&code_challenge_method=S256",
            effectiveIss,
            URLEncoder.encode(clientId, StandardCharsets.UTF_8),
            URLEncoder.encode(redirectUri, StandardCharsets.UTF_8),
            URLEncoder.encode(scope, StandardCharsets.UTF_8),
            URLEncoder.encode(state, StandardCharsets.UTF_8),
            URLEncoder.encode(launch, StandardCharsets.UTF_8),
            URLEncoder.encode(effectiveIss, StandardCharsets.UTF_8), // aud parameter (SMART best practice)
            URLEncoder.encode(codeChallenge, StandardCharsets.UTF_8),
            "S256"
        );
        
        // Redirect to Epic authorization URL
        response.sendRedirect(authorizeUrl);
    }

    /**
     * GET /api/patient/smart/callback?code=...&state=...
     * Exchanges authorization code for access token.
     * Validates state, uses PKCE code verifier, stores token server-side and sets HttpOnly cookie.
     * 
     * NOTE: For cross-origin SPA deployments:
     * - Frontend must send requests with withCredentials: true
     * - Backend CORS config must allow credentials (allowCredentials: true)
     * - Cookie SameSite must be Lax or None (None requires Secure: true)
     */
    @GetMapping("/callback")
    public void callback(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) String state,
            HttpServletRequest request,
            HttpServletResponse response) throws Exception {
        
        // Set cache control headers to prevent caching of sensitive auth responses
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, private");
        response.setHeader("Pragma", "no-cache");
        response.setDateHeader("Expires", 0);
        
        try {
            // Require state
            if (state == null || state.trim().isEmpty()) {
                redirectToLaunchWithError(response, "Missing state parameter");
                return;
            }
            
            // Validate state exists and not expired
            StateData stateData = stateStore.get(state);
            if (stateData == null) {
                redirectToLaunchWithError(response, "Invalid or expired state");
                return;
            }
            
            if (stateData.isExpired()) {
                stateStore.remove(state);
                redirectToLaunchWithError(response, "State expired");
                return;
            }
            
            // Delete state after validation (one-time use)
            stateStore.remove(state);
            
            // Exchange code for token (stub implementation)
            // In production, call Epic token endpoint:
            // POST {iss}/oauth2/token
            // with: grant_type=authorization_code, code, redirect_uri, client_id, client_secret, code_verifier
            // Response will include: access_token, expires_in (seconds), token_type, scope
            String accessToken = exchangeCodeForToken(code, stateData.getCodeVerifier(), stateData.getIss());
            
            // In production, parse expires_in from token response
            // For now, use default TTL (3600 seconds)
            long expiresInSeconds = TOKEN_EXPIRY_SECONDS; // TODO: Get from token response expires_in
            
            // Store token server-side with session ID
            String sessionId = UUID.randomUUID().toString();
            SmartSessionService.TokenData tokenData = new SmartSessionService.TokenData(accessToken, expiresInSeconds);
            smartSessionService.storeToken(sessionId, tokenData);
            
            // Set HttpOnly cookie with session ID using ResponseCookie (supports SameSite)
            // Cookie maxAge matches token expiry
            ResponseCookie cookie = ResponseCookie.from("SMART_SESSION", sessionId)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(tokenData.getRemainingSeconds()) // Use actual token expiry
                .sameSite("Lax")
                .build();
            
            response.addHeader("Set-Cookie", cookie.toString());
            
            // Redirect to MyChart home using absolute URL (frontend base URL)
            String redirectUrl = frontendBaseUrl.endsWith("/") 
                ? frontendBaseUrl + "mychart/home"
                : frontendBaseUrl + "/mychart/home";
            response.sendRedirect(redirectUrl);
            
        } catch (Exception e) {
            redirectToLaunchWithError(response, "Authentication failed: " + e.getMessage());
        }
    }

    /**
     * Stub method for token exchange. In production, call Epic token endpoint.
     */
    private String exchangeCodeForToken(String code, String codeVerifier, String iss) {
        // TODO: Implement actual token exchange
        // POST {iss}/oauth2/token
        // Headers: Content-Type: application/x-www-form-urlencoded
        // Body: grant_type=authorization_code&code={code}&redirect_uri={redirectUri}&client_id={clientId}&code_verifier={codeVerifier}
        
        // For now, return stub token
        return "stub_token_" + UUID.randomUUID().toString();
    }

    /**
     * GET /api/patient/smart/session
     * Checks if patient has valid SMART session.
     * Returns { authenticated: true/false, patientId, patientName, expiresAt }
     * 
     * NOTE: For cross-origin SPA deployments:
     * - Frontend must send requests with withCredentials: true
     * - Backend CORS config must allow credentials (allowCredentials: true)
     * - Cookie SameSite must be Lax or None (None requires Secure: true)
     */
    @GetMapping("/session")
    public ResponseEntity<SessionResponse> checkSession(HttpServletRequest request) {
        // Clean up expired entries
        cleanupExpiredEntries();
        
        // Set cache control headers to prevent caching of session status
        HttpHeaders headers = new HttpHeaders();
        headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
        headers.set("Pragma", "no-cache");
        headers.setDate("Expires", 0);
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return ResponseEntity.ok().headers(headers).body(new SessionResponse(false, null, null, null));
        }
        
        String sessionId = null;
        for (Cookie cookie : cookies) {
            if ("SMART_SESSION".equals(cookie.getName())) {
                sessionId = cookie.getValue();
                break;
            }
        }
        
        if (sessionId == null) {
            return ResponseEntity.ok().headers(headers).body(new SessionResponse(false, null, null, null));
        }
        
        SmartSessionService.TokenData tokenData = smartSessionService.getToken(sessionId);
        if (tokenData == null) {
            return ResponseEntity.ok().headers(headers).body(new SessionResponse(false, null, null, null));
        }
        
        // TODO: In production, extract patientId and patientName from token or token introspection
        // For now, return stub values when authenticated
        Long patientId = 1L; // TODO: Extract from token
        String patientName = "Patient User"; // TODO: Extract from token
        String expiresAt = tokenData.getExpiresAt().toString(); // ISO-8601 format
        
        return ResponseEntity.ok().headers(headers).body(new SessionResponse(true, patientId, patientName, expiresAt));
    }

    /**
     * POST /api/patient/smart/dev-session
     * DEVELOPMENT ONLY: Creates a test SMART session without Epic OAuth.
     * This bypasses Epic authentication for local development.
     * 
     * @param patientId Optional patient ID (defaults to 1)
     */
    @PostMapping("/dev-session")
    public ResponseEntity<Map<String, String>> createDevSession(
            @RequestParam(required = false, defaultValue = "1") Long patientId,
            HttpServletResponse response) {
        
        // Create a test token data
        String accessToken = "dev-token-" + UUID.randomUUID().toString();
        SmartSessionService.TokenData tokenData = new SmartSessionService.TokenData(accessToken, TOKEN_EXPIRY_SECONDS);
        
        // Override patientId if provided
        if (patientId != null) {
            tokenData.setPatientId(patientId);
            tokenData.setPatientName("Test Patient " + patientId);
        }
        
        // Store token server-side with session ID
        String sessionId = UUID.randomUUID().toString();
        smartSessionService.storeToken(sessionId, tokenData);
        
        // Set HttpOnly cookie with session ID
        ResponseCookie cookie = ResponseCookie.from("SMART_SESSION", sessionId)
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .maxAge(tokenData.getRemainingSeconds())
            .sameSite("Lax")
            .build();
        
        response.addHeader("Set-Cookie", cookie.toString());
        
        return ResponseEntity.ok(Map.of(
            "success", "true",
            "message", "Development session created",
            "patientId", String.valueOf(tokenData.getPatientId()),
            "sessionId", sessionId
        ));
    }

    /**
     * POST /api/patient/smart/logout
     * Logs out patient by clearing SMART session.
     */
    @PostMapping("/logout")
    public ResponseEntity<LogoutResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("SMART_SESSION".equals(cookie.getName())) {
                    String sessionId = cookie.getValue();
                    // Remove token from store
                    smartSessionService.deleteToken(sessionId);
                    break;
                }
            }
        }
        
        // Clear cookie by setting Max-Age=0
        ResponseCookie cookie = ResponseCookie.from("SMART_SESSION", "")
            .httpOnly(true)
            .secure(cookieSecure)
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();
        
        response.addHeader("Set-Cookie", cookie.toString());
        
        return ResponseEntity.ok(new LogoutResponse(true));
    }

    /**
     * Helper to redirect to launch page with error.
     * Uses absolute URL (frontend base URL) for cross-origin compatibility.
     */
    private void redirectToLaunchWithError(HttpServletResponse response, String error) throws Exception {
        String errorParam = URLEncoder.encode(error, StandardCharsets.UTF_8);
        String redirectUrl = frontendBaseUrl.endsWith("/") 
            ? frontendBaseUrl + "mychart/launch?error=" + errorParam
            : frontendBaseUrl + "/mychart/launch?error=" + errorParam;
        response.sendRedirect(redirectUrl);
    }

    // DTOs
    @lombok.Data
    public static class AuthorizeResponse {
        private String url;
        
        public AuthorizeResponse(String url) {
            this.url = url;
        }
    }

    @lombok.Data
    public static class SessionResponse {
        private boolean authenticated;
        private Long patientId;
        private String patientName;
        private String expiresAt;
        
        public SessionResponse(boolean authenticated, Long patientId, String patientName, String expiresAt) {
            this.authenticated = authenticated;
            this.patientId = patientId;
            this.patientName = patientName;
            this.expiresAt = expiresAt;
        }
    }

    @lombok.Data
    public static class LogoutResponse {
        private boolean success;
        
        public LogoutResponse(boolean success) {
            this.success = success;
        }
    }
}
