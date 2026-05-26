package com.ehr.staffservice.controller;

import com.ehr.staffservice.entity.User;
import com.ehr.staffservice.service.SessionService;
import com.ehr.staffservice.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final SessionService sessionService;

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class UserSummary {
        private Long userId;
        private String username;
        private String role;
        private Long patientId;
        private Long staffId;

        public static UserSummary fromSession(SessionService.SessionData session) {
            UserSummary summary = new UserSummary();
            summary.setUserId(session.getUserId());
            summary.setUsername(session.getUsername());
            summary.setRole(session.getRole());
            summary.setPatientId(session.getPatientId());
            summary.setStaffId(session.getStaffId());
            return summary;
        }
    }

    /**
     * POST /api/auth/login
     * Authenticates user and sets APP_SESSION cookie.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        // Validate input
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            log.warn("Login attempt with empty username");
            return ResponseEntity.status(400).body(Map.of("error", "Username is required"));
        }
        
        if (request.getPassword() == null || request.getPassword().isEmpty()) {
            log.warn("Login attempt with empty password for user: {}", request.getUsername());
            return ResponseEntity.status(400).body(Map.of("error", "Password is required"));
        }
        
        try {
            log.debug("Login attempt for user: {}", request.getUsername());
            
            Optional<User> userOpt = userService.authenticate(request.getUsername(), request.getPassword());
            
            if (userOpt.isEmpty()) {
                log.warn("Failed login attempt for user: {} - invalid credentials", request.getUsername());
                return ResponseEntity.status(401).body(Map.of("error", "Invalid username or password"));
            }
            
            User user = userOpt.get();
            
            if (!user.getActive()) {
                log.warn("Login attempt for inactive user: {}", request.getUsername());
                return ResponseEntity.status(403).body(Map.of("error", "Account is inactive"));
            }
            
            log.info("Successful login for user: {} (role: {})", request.getUsername(), user.getRole());
            
            // Create session
            String sessionId = sessionService.createSession(
                user.getUserId(),
                user.getUsername(),
                user.getRole(),
                user.getPatientId(),
                user.getStaffId()
            );
            
            // Set APP_SESSION cookie
            ResponseCookie cookie = ResponseCookie.from("APP_SESSION", sessionId)
                .httpOnly(true)
                .secure(sessionService.isCookieSecure())
                .path("/")
                .maxAge(3600) // 1 hour
                .sameSite("Lax")
                .build();
            
            response.addHeader("Set-Cookie", cookie.toString());
            
            // Return user summary
            UserSummary summary = new UserSummary();
            summary.setUserId(user.getUserId());
            summary.setUsername(user.getUsername());
            summary.setRole(user.getRole());
            summary.setPatientId(user.getPatientId());
            summary.setStaffId(user.getStaffId());
            
            return ResponseEntity.ok(summary);
        } catch (IllegalArgumentException e) {
            log.error("Login error - invalid argument: {}", e.getMessage(), e);
            return ResponseEntity.status(400).body(Map.of("error", "Invalid request: " + e.getMessage()));
        } catch (org.springframework.dao.DataAccessException e) {
            log.error("Database error during login for user: {} - Exception: {} - Message: {}", 
                    request.getUsername(), e.getClass().getSimpleName(), e.getMessage(), e);
            return ResponseEntity.status(500).body(Map.of(
                "error", "Database error. Please check if users table exists and patient1 user is created.",
                "details", "Check backend logs for details"
            ));
        } catch (Exception e) {
            log.error("Unexpected error during login for user: {} - Exception: {} - Message: {} - Cause: {}", 
                    request.getUsername(), 
                    e.getClass().getName(), 
                    e.getMessage(),
                    e.getCause() != null ? e.getCause().getClass().getName() + ": " + e.getCause().getMessage() : "none",
                    e);
            // Include more details in development
            String errorMsg = "Internal server error. Please try again later.";
            if (e.getMessage() != null && e.getMessage().contains("users")) {
                errorMsg = "Database error: Users table may not exist. Please run database migrations.";
            }
            return ResponseEntity.status(500).body(Map.of("error", errorMsg));
        }
    }

    /**
     * GET /api/auth/me
     * Returns current user information from APP_SESSION cookie.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(HttpServletRequest request) {
        try {
            SessionService.SessionData session = (SessionService.SessionData) request.getAttribute("sessionData");
            
            if (session == null) {
                log.debug("GET /api/auth/me - no session found");
                return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
            }
            
            log.debug("GET /api/auth/me - user: {} (role: {})", session.getUsername(), session.getRole());
            UserSummary summary = UserSummary.fromSession(session);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            log.error("Error in GET /api/auth/me", e);
            return ResponseEntity.status(500).body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * POST /api/auth/logout
     * Clears APP_SESSION cookie.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Extract session ID from cookie
        String sessionId = extractSessionId(request);
        if (sessionId != null) {
            sessionService.deleteSession(sessionId);
        }
        
        // Clear cookie
        ResponseCookie cookie = ResponseCookie.from("APP_SESSION", "")
            .httpOnly(true)
            .secure(sessionService.isCookieSecure())
            .path("/")
            .maxAge(0)
            .sameSite("Lax")
            .build();
        
        response.addHeader("Set-Cookie", cookie.toString());
        
        return ResponseEntity.ok(Map.of("success", true));
    }

    private String extractSessionId(HttpServletRequest request) {
        jakarta.servlet.http.Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        
        for (jakarta.servlet.http.Cookie cookie : cookies) {
            if ("APP_SESSION".equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        
        return null;
    }
}

