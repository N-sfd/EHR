package com.ehr.staffservice.config;

import com.ehr.staffservice.util.PhiMaskingUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

/**
 * Request/Response logging filter with PHI masking
 * Logs all API requests and responses, masking PHI fields
 */
@Slf4j
@Component
@Order(1)
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, 
                                   @NonNull FilterChain filterChain) throws ServletException, IOException {
        
        // Skip logging for static resources and health checks
        String path = request.getRequestURI();
        if (path.startsWith("/actuator") || 
            path.startsWith("/swagger") || 
            path.startsWith("/v3/api-docs") ||
            path.endsWith(".css") || 
            path.endsWith(".js") || 
            path.endsWith(".png") || 
            path.endsWith(".jpg") || 
            path.endsWith(".ico")) {
            filterChain.doFilter(request, response);
            return;
        }
        
        ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request);
        ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
        
        try {
            filterChain.doFilter(wrappedRequest, wrappedResponse);
        } finally {
            logRequest(wrappedRequest);
            logResponse(wrappedRequest, wrappedResponse);
            wrappedResponse.copyBodyToResponse();
        }
    }
    
    private void logRequest(ContentCachingRequestWrapper request) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        String queryString = request.getQueryString();
        String fullUri = queryString != null ? uri + "?" + queryString : uri;
        
        // Only log at DEBUG level to reduce noise
        byte[] content = request.getContentAsByteArray();
        if (content.length > 0 && content.length < 1000) { // Only log small request bodies
            String body = new String(content, StandardCharsets.UTF_8);
            String maskedBody = PhiMaskingUtil.maskPhi(body);
            log.debug("REQUEST: {} {} | Body: {}", method, fullUri, maskedBody);
        } else {
            log.debug("REQUEST: {} {} | Body size: {} bytes", method, fullUri, content.length);
        }
    }
    
    private void logResponse(@NonNull ContentCachingRequestWrapper request, @NonNull ContentCachingResponseWrapper response) {
        String method = request.getMethod();
        String uri = request.getRequestURI();
        int status = response.getStatus();
        
        byte[] content = response.getContentAsByteArray();
        // Only log small response bodies at DEBUG level to reduce noise
        // Skip logging large responses (like those with base64 images)
        if (content.length > 0 && content.length < 5000 && status < 400) {
            String body = new String(content, StandardCharsets.UTF_8);
            String maskedBody = PhiMaskingUtil.maskPhi(body);
            log.debug("RESPONSE: {} {} | Status: {} | Body: {}", method, uri, status, maskedBody);
        } else {
            log.debug("RESPONSE: {} {} | Status: {} | Body size: {} bytes", method, uri, status, content.length);
        }
    }
}

