package com.ehr.staffservice.ai.service;

import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AiAuthorizationServiceTest {
    private final AiAuthorizationService service = new AiAuthorizationService();

    @Test
    void providerCanAccessAnyPatient() {
        Authentication auth = new UsernamePasswordAuthenticationToken(
                Map.of("userId", 10L),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_PROVIDER"))
        );
        assertDoesNotThrow(() -> service.assertCanAccessPatient(auth, 123L));
    }

    @Test
    void patientCanOnlyAccessOwnRecord() {
        Authentication own = new UsernamePasswordAuthenticationToken(
                Map.of("userId", 11L, "patientId", 123L),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))
        );
        Authentication other = new UsernamePasswordAuthenticationToken(
                Map.of("userId", 11L, "patientId", 123L),
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))
        );
        assertDoesNotThrow(() -> service.assertCanAccessPatient(own, 123L));
        assertThrows(SecurityException.class, () -> service.assertCanAccessPatient(other, 456L));
    }

    @Test
    void smartSessionPatientPrincipalCanBeParsed() {
        Authentication smartPatient = new UsernamePasswordAuthenticationToken(
                "smart_patient_123",
                "n/a",
                List.of(new SimpleGrantedAuthority("ROLE_PATIENT"))
        );
        assertDoesNotThrow(() -> service.assertCanAccessPatient(smartPatient, 123L));
        assertThrows(SecurityException.class, () -> service.assertCanAccessPatient(smartPatient, 456L));
    }
}
