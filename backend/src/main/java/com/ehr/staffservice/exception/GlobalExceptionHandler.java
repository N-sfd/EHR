package com.ehr.staffservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.Instant;
import java.util.stream.Collectors;

/**
 * Global exception handler that returns standardized error responses.
 * All errors include correlation ID for debugging.
 */
@Slf4j
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final String CORRELATION_ID_KEY = "correlationId";

    /**
     * Handle ResourceNotFoundException (404).
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        
        String correlationId = getCorrelationId();
        log.error("[CorrelationId: {}] Resource not found: {} - Path: {}", 
                correlationId, ex.getMessage(), request.getRequestURI(), ex);
        
        ErrorResponse error = buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                ex.getMessage(),
                request.getRequestURI(),
                correlationId
        );
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle validation errors (400).
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        
        String correlationId = getCorrelationId();
        String validationErrors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));
        
        log.error("[CorrelationId: {}] Validation failed: {} - Path: {} - Errors: {}", 
                correlationId, ex.getMessage(), request.getRequestURI(), validationErrors, ex);
        
        ErrorResponse error = buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "VALIDATION_ERROR",
                "Validation failed: " + validationErrors,
                request.getRequestURI(),
                correlationId
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle IllegalArgumentException (400).
     */
    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        
        String correlationId = getCorrelationId();
        log.error("[CorrelationId: {}] Bad request: {} - Path: {}", 
                correlationId, ex.getMessage(), request.getRequestURI(), ex);
        
        ErrorResponse error = buildErrorResponse(
                HttpStatus.BAD_REQUEST,
                "BAD_REQUEST",
                ex.getMessage(),
                request.getRequestURI(),
                correlationId
        );
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    /**
     * Handle DuplicateResourceException (409).
     */
    @ExceptionHandler(DuplicateResourceException.class)
    @ResponseStatus(HttpStatus.CONFLICT)
    public ResponseEntity<ErrorResponse> handleDuplicateResource(
            DuplicateResourceException ex, HttpServletRequest request) {
        
        String correlationId = getCorrelationId();
        log.error("[CorrelationId: {}] Duplicate resource: {} - Path: {}", 
                correlationId, ex.getMessage(), request.getRequestURI(), ex);
        
        ErrorResponse error = buildErrorResponse(
                HttpStatus.CONFLICT,
                "DUPLICATE_RESOURCE",
                ex.getMessage(),
                request.getRequestURI(),
                correlationId
        );
        
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    /**
     * Handle AccessDeniedException (403).
     */
    @ExceptionHandler({AccessDeniedException.class, AuthenticationCredentialsNotFoundException.class})
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            Exception ex, HttpServletRequest request) {
        
        String correlationId = getCorrelationId();
        log.error("[CorrelationId: {}] Access denied: {} - Path: {}", 
                correlationId, ex.getMessage(), request.getRequestURI(), ex);
        
        ErrorResponse error = buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                "Access denied",
                request.getRequestURI(),
                correlationId
        );
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(SecurityException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ResponseEntity<ErrorResponse> handleSecurityException(
            SecurityException ex, HttpServletRequest request) {
        String correlationId = getCorrelationId();
        ErrorResponse error = buildErrorResponse(
                HttpStatus.FORBIDDEN,
                "FORBIDDEN",
                ex.getMessage(),
                request.getRequestURI(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    /**
     * Handle NoResourceFoundException (e.g. request for non-existent static resource or path).
     * Return 404 and log at debug to avoid noisy ERROR stack traces when clients hit unknown paths.
     */
    @ExceptionHandler(NoResourceFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ResponseEntity<ErrorResponse> handleNoResourceFound(
            NoResourceFoundException ex, HttpServletRequest request) {

        String correlationId = getCorrelationId();
        if (log.isDebugEnabled()) {
            log.debug("[CorrelationId: {}] No resource found: path={}", correlationId, ex.getResourcePath());
        }

        ErrorResponse error = buildErrorResponse(
                HttpStatus.NOT_FOUND,
                "NOT_FOUND",
                "No resource found for path: " + ex.getResourcePath(),
                request.getRequestURI(),
                correlationId
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    /**
     * Handle all other exceptions (500).
     */
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        
        String correlationId = getCorrelationId();
        String stackTrace = getStackTrace(ex);
        
        // In development, return the real exception message so the frontend can show actionable errors.
        // In non-dev environments, keep the message generic to avoid leaking internals.
        String activeProfiles = System.getProperty("spring.profiles.active", "");
        boolean isDev = activeProfiles != null && activeProfiles.contains("dev");
        String safeMessage = "An unexpected error occurred";
        if (isDev && ex.getMessage() != null && !ex.getMessage().trim().isEmpty()) {
            safeMessage = ex.getMessage().trim();
        }
        
        log.error("[CorrelationId: {}] Internal server error: {} - Path: {} - Exception: {} - Stack trace:\n{}", 
                correlationId, ex.getMessage(), request.getRequestURI(), 
                ex.getClass().getSimpleName(), stackTrace);
        
        ErrorResponse error = buildErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR",
                safeMessage,
                request.getRequestURI(),
                correlationId
        );
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    /**
     * Get stack trace as string for logging.
     */
    private String getStackTrace(Exception e) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        e.printStackTrace(pw);
        return sw.toString();
    }

    /**
     * Build standardized error response.
     */
    private ErrorResponse buildErrorResponse(
            HttpStatus status, String code, String message, String path, String correlationId) {
        
        return new ErrorResponse(
                Instant.now().toString(),
                status.value(),
                code,
                message,
                path,
                correlationId
        );
    }

    /**
     * Get correlation ID from MDC or generate one.
     */
    private String getCorrelationId() {
        String correlationId = MDC.get(CORRELATION_ID_KEY);
        if (correlationId == null || correlationId.isEmpty()) {
            correlationId = java.util.UUID.randomUUID().toString();
            MDC.put(CORRELATION_ID_KEY, correlationId);
        }
        return correlationId;
    }

    /**
     * Standard error response DTO.
     */
    public static class ErrorResponse {
        private String timestamp;
        private int status;
        private String error;
        private String message;
        private String path;
        private String correlationId;

        public ErrorResponse(String timestamp, int status, String error, String message, 
                           String path, String correlationId) {
            this.timestamp = timestamp;
            this.status = status;
            this.error = error;
            this.message = message;
            this.path = path;
            this.correlationId = correlationId;
        }

        // Getters
        public String getTimestamp() { return timestamp; }
        public int getStatus() { return status; }
        public String getError() { return error; }
        public String getMessage() { return message; }
        public String getPath() { return path; }
        public String getCorrelationId() { return correlationId; }
    }
}
