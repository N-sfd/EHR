package com.ehr.staffservice.config;

import com.ehr.staffservice.service.SessionService;
import com.ehr.staffservice.service.SmartSessionService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Unified session filter that supports both APP_SESSION and SMART_SESSION cookies.
 * 
 * Priority:
 * 1. If APP_SESSION is present and valid -> authenticate as User (ADMIN/PROVIDER/PATIENT)
 * 2. Else if SMART_SESSION is present and valid -> authenticate as PATIENT
 * 3. Else -> no authentication (will be handled by Spring Security)
 */
@Component
@RequiredArgsConstructor
public class AppSessionFilter extends OncePerRequestFilter {

    private final SessionService sessionService;
    private final SmartSessionService smartSessionService;

    @Override
    protected void doFilterInternal(@org.springframework.lang.NonNull HttpServletRequest request, 
                                     @org.springframework.lang.NonNull HttpServletResponse response, 
                                     @org.springframework.lang.NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        // Priority 1: Check APP_SESSION (Phase A authentication)
        String appSessionId = extractCookie(request, "APP_SESSION");
        if (appSessionId != null) {
            SessionService.SessionData session = sessionService.getSession(appSessionId);
            if (session != null) {
                // Set Spring Security authentication with user's role
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    session.getUserId(),
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + session.getRole()))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // Store session data in request attribute for controllers to access
                request.setAttribute("sessionData", session);
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        // Priority 2: Check SMART_SESSION (SMART on FHIR authentication)
        String smartSessionId = extractCookie(request, "SMART_SESSION");
        if (smartSessionId != null) {
            SmartSessionService.TokenData tokenData = smartSessionService.getToken(smartSessionId);
            if (tokenData != null && !tokenData.isExpired()) {
                // Authenticate as PATIENT role
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    "smart_patient_" + tokenData.getPatientId(), // Use patientId as principal
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_PATIENT"))
                );
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // Create a session-like data structure for controllers
                SessionService.SessionData smartSession = new SessionService.SessionData(
                    null, // No userId for SMART sessions
                    "smart_patient",
                    "PATIENT",
                    tokenData.getPatientId(),
                    null // No staffId for SMART sessions
                );
                request.setAttribute("sessionData", smartSession);
                filterChain.doFilter(request, response);
                return;
            }
        }
        
        // No valid session found - continue filter chain (Spring Security will handle authorization)
        filterChain.doFilter(request, response);
    }

    private String extractCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        
        for (Cookie cookie : cookies) {
            if (cookieName.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        
        return null;
    }
}

