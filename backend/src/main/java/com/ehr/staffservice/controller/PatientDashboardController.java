package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.ApiResult;
import com.ehr.staffservice.dto.PatientDashboardDto;
import com.ehr.staffservice.service.DashboardService;
import com.ehr.staffservice.service.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.function.Supplier;

/**
 * Patient dashboard controller (Epic-style).
 * Provides aggregated dashboard data for MyChart home page.
 */
@Slf4j
@RestController
@RequestMapping(value = "/api/patient/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientDashboardController {

    private final DashboardService dashboardService;

    /**
     * Safe wrapper helper that catches ALL exceptions (including Throwable) and returns safe defaults.
     * Ensures dashboard endpoints NEVER return 500 - always return HTTP 200 with ApiResult.success().
     */
    private <T> ResponseEntity<ApiResult<T>> safe(
            Supplier<T> supplier, 
            T fallback, 
            String endpointName,
            Long patientId) {
        String correlationId = MDC.get("correlationId");
        String requestPath = "/api/patient/dashboard/" + endpointName;
        
        try {
            T result = supplier.get();
            // Ensure result is never null
            if (result == null) {
                log.warn("[CorrelationId: {}] {} - patientId: {} - Result is null, using fallback", 
                        correlationId, requestPath, patientId);
                return ResponseEntity.ok(ApiResult.success(fallback));
            }
            log.info("[CorrelationId: {}] {} - patientId: {} - Success", correlationId, requestPath, patientId);
            return ResponseEntity.ok(ApiResult.success(result));
        } catch (Throwable ex) {
            // Catch ALL exceptions including Error, RuntimeException, etc.
            String stackTrace = getStackTrace(ex);
            log.error("[CorrelationId: {}] {} - patientId: {} - Dashboard {} failed. Returning safe defaults. Exception: {} - Message: {} - Stack trace:\n{}", 
                    correlationId, requestPath, patientId, endpointName, 
                    ex.getClass().getSimpleName(), ex.getMessage(), stackTrace);
            return ResponseEntity.ok(ApiResult.success(fallback));
        }
    }

    /**
     * GET /api/patient/dashboard
     * Returns Epic-style dashboard data: patient summary, counts, next appointment, alerts, care team.
     */
    @GetMapping
    public ResponseEntity<PatientDashboardDto> getDashboard(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        log.debug("Dashboard request received - session present: {}, patientId: {}", 
                session != null, 
                session != null ? session.getPatientId() : "null");
        
        if (session == null || session.getPatientId() == null) {
            log.warn("Dashboard request without valid session - session: {}, patientId: {}, userId: {}, role: {}", 
                    session != null ? "present" : "null",
                    session != null ? session.getPatientId() : "null",
                    session != null ? session.getUserId() : "null",
                    session != null ? session.getRole() : "null");
            // Return 401 with a clear error message
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED)
                    .body(null); // Frontend will handle the 401 status
        }
        
        try {
            Long patientId = session.getPatientId();
            log.info("Building dashboard for patientId: {} (userId: {}, role: {})", 
                    patientId, session.getUserId(), session.getRole());
            
            long startTime = System.currentTimeMillis();
            PatientDashboardDto dashboard = dashboardService.getPatientDashboard(patientId);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("Dashboard built successfully for patientId: {} - Duration: {}ms - Tiles: {}, Alerts: {}, CareTeam: {}", 
                    patientId, 
                    duration,
                    dashboard.getTiles() != null ? dashboard.getTiles().size() : 0,
                    dashboard.getAlerts() != null ? dashboard.getAlerts().size() : 0,
                    dashboard.getCareTeam() != null ? "present" : "null");
            
            return ResponseEntity.ok(dashboard);
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.error("Patient not found for dashboard - patientId: {} - Message: {} - Stack trace: {}", 
                    session.getPatientId(), 
                    e.getMessage(),
                    getStackTrace(e));
            throw e; // Re-throw to let GlobalExceptionHandler handle it (returns 404)
        } catch (RuntimeException e) {
            Long patientIdForLog = session != null ? session.getPatientId() : null;
            log.error("RuntimeException building dashboard for patientId: {} - Exception: {} - Message: {} - Cause: {} - Stack trace: {}", 
                    patientIdForLog, 
                    e.getClass().getSimpleName(), 
                    e.getMessage(),
                    e.getCause() != null ? e.getCause().getClass().getSimpleName() + ": " + e.getCause().getMessage() : "none",
                    getStackTrace(e));
            throw new RuntimeException("Failed to build dashboard: " + e.getMessage(), e);
        } catch (Exception e) {
            Long patientIdForLog = session != null ? session.getPatientId() : null;
            log.error("Unexpected error building dashboard for patientId: {} - Exception: {} - Message: {} - Cause: {} - Stack trace: {}", 
                    patientIdForLog, 
                    e.getClass().getSimpleName(), 
                    e.getMessage(),
                    e.getCause() != null ? e.getCause().getClass().getSimpleName() + ": " + e.getCause().getMessage() : "none",
                    getStackTrace(e));
            throw new RuntimeException("Failed to build dashboard: " + e.getMessage(), e);
        }
    }
    
    /**
     * GET /api/patient/dashboard/tiles
     * Returns dashboard tiles independently (never throws 500, always returns ok=true with safe defaults).
     */
    @GetMapping("/tiles")
    public ResponseEntity<ApiResult<PatientDashboardDto.DashboardTileDto[]>> getTiles(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        String correlationId = MDC.get("correlationId");
        String requestPath = "/api/patient/dashboard/tiles";
        
        log.warn("[CorrelationId: {}] GET {} - Controller hit", correlationId, requestPath);
        
        // Move ALL throwable code (session lookup, patientId extraction, service call) inside Supplier
        return safe(
            () -> {
                // Session and patientId lookup happens INSIDE Supplier - any NPE/exception is caught
                if (session == null || session.getPatientId() == null) {
                    log.warn("[CorrelationId: {}] {} - No valid session, returning empty array", correlationId, requestPath);
                    return new PatientDashboardDto.DashboardTileDto[0];
                }
                
                Long patientId = session.getPatientId();
                log.info("[CorrelationId: {}] {} - patientId: {}", correlationId, requestPath, patientId);
                
                // Service call that can throw - all inside Supplier
                return dashboardService.getDashboardTiles(patientId);
            },
            new PatientDashboardDto.DashboardTileDto[0],
            "tiles",
            session != null ? session.getPatientId() : null
        );
    }

    /**
     * GET /api/patient/dashboard/action-center
     * Returns action center data independently (never throws 500, always returns ok=true with safe defaults).
     * Action center is represented by completeness summary.
     */
    @GetMapping("/action-center")
    public ResponseEntity<ApiResult<PatientDashboardDto.CompletenessSummaryDto>> getActionCenter(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        String correlationId = MDC.get("correlationId");
        String requestPath = "/api/patient/dashboard/action-center";
        
        log.warn("[CorrelationId: {}] GET {} - Controller hit", correlationId, requestPath);
        
        // Move ALL throwable code (session lookup, patientId extraction, service call) inside Supplier
        return safe(
            () -> {
                // Session and patientId lookup happens INSIDE Supplier - any NPE/exception is caught
                if (session == null || session.getPatientId() == null) {
                    log.warn("[CorrelationId: {}] {} - No valid session, returning safe default", correlationId, requestPath);
                    return PatientDashboardDto.CompletenessSummaryDto.safeDefault();
                }
                
                Long patientId = session.getPatientId();
                log.info("[CorrelationId: {}] {} - patientId: {}", correlationId, requestPath, patientId);
                
                // Service call that can throw - all inside Supplier
                return dashboardService.getActionCenter(patientId);
            },
            PatientDashboardDto.CompletenessSummaryDto.safeDefault(),
            "action-center",
            session != null ? session.getPatientId() : null
        );
    }

    /**
     * GET /api/patient/dashboard/care-team
     * Returns care team data independently (never throws 500, always returns ok=true with safe defaults).
     */
    @GetMapping("/care-team")
    public ResponseEntity<ApiResult<PatientDashboardDto.CareTeamDto>> getCareTeam(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        String correlationId = MDC.get("correlationId");
        String requestPath = "/api/patient/dashboard/care-team";
        
        log.warn("[CorrelationId: {}] GET {} - Controller hit", correlationId, requestPath);
        
        // Move ALL throwable code (session lookup, patientId extraction, service call) inside Supplier
        return safe(
            () -> {
                // Session and patientId lookup happens INSIDE Supplier - any NPE/exception is caught
                if (session == null || session.getPatientId() == null) {
                    log.warn("[CorrelationId: {}] {} - No valid session, returning safe default", correlationId, requestPath);
                    return PatientDashboardDto.CareTeamDto.safeDefault();
                }
                
                Long patientId = session.getPatientId();
                log.info("[CorrelationId: {}] {} - patientId: {}", correlationId, requestPath, patientId);
                
                // Service call that can throw - all inside Supplier
                return dashboardService.getCareTeam(patientId);
            },
            PatientDashboardDto.CareTeamDto.safeDefault(),
            "care-team",
            session != null ? session.getPatientId() : null
        );
    }
    
    /**
     * Get stack trace as string for logging.
     * Handles both Exception and Throwable.
     */
    private String getStackTrace(Throwable t) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        t.printStackTrace(pw);
        return sw.toString();
    }
}

