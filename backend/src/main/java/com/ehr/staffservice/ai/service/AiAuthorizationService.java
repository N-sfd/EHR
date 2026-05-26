package com.ehr.staffservice.ai.service;

import com.ehr.staffservice.service.SessionService;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.lang.reflect.Method;
import java.util.Map;

@Service
@ConditionalOnProperty(prefix = "app.ai", name = "enabled", havingValue = "true")
public class AiAuthorizationService {

    public void assertCanAccessPatient(Authentication auth, Long patientId) {
        if (auth == null || !auth.isAuthenticated()) {
            throw new SecurityException("Authentication required");
        }
        if (hasRole(auth, "ROLE_ADMIN") || hasRole(auth, "ROLE_PROVIDER")) {
            return;
        }
        if (hasRole(auth, "ROLE_PATIENT")) {
            Long currentPatientId = extractPatientId(auth);
            if (currentPatientId != null && currentPatientId.equals(patientId)) {
                return;
            }
        }
        throw new SecurityException("Access denied for requested patient context");
    }

    public Long currentUserId(Authentication auth) {
        if (auth == null) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof Map<?, ?> map) {
            Object userId = map.get("userId");
            if (userId instanceof Number n) {
                return n.longValue();
            }
        }
        return null;
    }

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(role::equals);
    }

    private Long extractPatientId(Authentication auth) {
        Object principal = auth.getPrincipal();
        Long patientId = extractPatientIdFromPrincipal(principal);
        if (patientId != null) {
            return patientId;
        }

        patientId = extractPatientIdFromSessionAttribute();
        if (patientId != null) {
            return patientId;
        }

        return null;
    }

    private Long extractPatientIdFromPrincipal(Object principal) {
        if (principal == null) {
            return null;
        }

        if (principal instanceof Map<?, ?> map) {
            Object pid = map.get("patientId");
            if (pid instanceof Number n) {
                return n.longValue();
            }
            if (pid instanceof String s) {
                return parseLongOrNull(s);
            }
        }

        if (principal instanceof Number n) {
            return n.longValue();
        }

        if (principal instanceof String s) {
            if (s.startsWith("smart_patient_")) {
                return parseLongOrNull(s.substring("smart_patient_".length()));
            }
            return parseLongOrNull(s);
        }

        try {
            Method method = principal.getClass().getMethod("getPatientId");
            Object value = method.invoke(principal);
            if (value instanceof Number n) {
                return n.longValue();
            }
            if (value instanceof String s) {
                return parseLongOrNull(s);
            }
        } catch (Exception ignored) {
            // intentionally ignored; fallback is null
        }

        return null;
    }

    private Long extractPatientIdFromSessionAttribute() {
        try {
            RequestAttributes requestAttributes = RequestContextHolder.getRequestAttributes();
            if (requestAttributes instanceof ServletRequestAttributes servletAttributes) {
                Object sessionData = servletAttributes.getRequest().getAttribute("sessionData");
                if (sessionData instanceof SessionService.SessionData data) {
                    return data.getPatientId();
                }
                if (sessionData instanceof Map<?, ?> map) {
                    Object pid = map.get("patientId");
                    if (pid instanceof Number n) {
                        return n.longValue();
                    }
                    if (pid instanceof String s) {
                        return parseLongOrNull(s);
                    }
                }
            }
        } catch (Exception ignored) {
            // ignore missing request context
        }
        return null;
    }

    private Long parseLongOrNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            return Long.valueOf(value.trim());
        } catch (NumberFormatException ignored) {
            return null;
        }
    }
}
