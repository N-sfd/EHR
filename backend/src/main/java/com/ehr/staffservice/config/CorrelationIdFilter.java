package com.ehr.staffservice.config;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter that reads/generates correlation ID and adds it to MDC and response headers.
 * This allows correlation IDs to be tracked across the entire request lifecycle.
 */
@Slf4j
@Component
@Order(1) // Execute early in the filter chain
public class CorrelationIdFilter implements Filter {

    private static final String CORRELATION_ID_HEADER = "X-Correlation-Id";
    private static final String MDC_CORRELATION_ID_KEY = "correlationId";

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        HttpServletResponse httpResponse = (HttpServletResponse) response;

        // Get or generate correlation ID
        String correlationId = httpRequest.getHeader(CORRELATION_ID_HEADER);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }

        // Add to MDC for logging
        MDC.put(MDC_CORRELATION_ID_KEY, correlationId);

        try {
            // Add to response header
            httpResponse.setHeader(CORRELATION_ID_HEADER, correlationId);

            // Continue filter chain
            chain.doFilter(request, response);
        } finally {
            // Clean up MDC
            MDC.remove(MDC_CORRELATION_ID_KEY);
        }
    }
}

