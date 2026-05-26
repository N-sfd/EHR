package com.ehr.staffservice.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration supporting both APP_SESSION and SMART_SESSION authentication.
 * 
 * Authentication Flow:
 * - APP_SESSION: Phase A username/password login (ADMIN/PROVIDER/PATIENT roles)
 * - SMART_SESSION: SMART on FHIR OAuth flow (PATIENT role only)
 * 
 * Authorization Rules:
 * - PATIENT role: Can access /api/patients/me, /api/appointments/me, /api/auth/me
 * - ADMIN/PROVIDER roles: Can access all staff endpoints
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final AppSessionFilter appSessionFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // Disable CSRF for API (using cookies with SameSite)
            .cors(Customizer.withDefaults()) // Use CorsConfigurationSource bean (local dev ports)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // We handle sessions manually
            )
            .addFilterBefore(appSessionFilter, UsernamePasswordAuthenticationFilter.class)
            .authorizeHttpRequests(auth -> auth
                // CORS preflight must not require auth (direct browser → backend on another port)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public endpoints (no authentication required)
                .requestMatchers("/api/health").permitAll()
                .requestMatchers("/api/features").permitAll() // SPA feature flags (no auth); safe booleans only
                .requestMatchers("/api/patient/smart/launch").permitAll()
                .requestMatchers("/api/patient/smart/callback").permitAll()
                .requestMatchers("/api/patient/smart/session").permitAll()
                .requestMatchers("/api/patient/smart/logout").permitAll()
                .requestMatchers("/api/patient/smart/dev-session").permitAll() // Development: create test session
                .requestMatchers("/api/auth/login").permitAll()
                
                // Patient self-service endpoints (require PATIENT role)
                .requestMatchers("/api/auth/me").authenticated() // Both APP_SESSION and SMART_SESSION can access
                .requestMatchers("/api/patients/me").hasRole("PATIENT")
                .requestMatchers("/api/appointments/me").hasRole("PATIENT") // GET and POST
                .requestMatchers("/api/patient/dashboard").hasRole("PATIENT") // Patient dashboard
                .requestMatchers("/api/patient/dashboard/**").hasRole("PATIENT") // Patient dashboard sub-endpoints (tiles, action-center, care-team)
                .requestMatchers("/api/patient/profile").hasRole("PATIENT") // Patient profile
                .requestMatchers("/api/patient/encounters/**").hasRole("PATIENT") // Patient encounters
                .requestMatchers("/api/patients/{id}/registration/completeness").hasAnyRole("PATIENT", "ADMIN", "PROVIDER") // Registration completeness
                .requestMatchers("/api/patient-portal/**").hasRole("PATIENT") // Patient portal endpoints
                .requestMatchers("/api/appointments/{id}/echeckin/**").hasRole("PATIENT") // eCheck-in endpoints
                .requestMatchers("/fhir/**").hasRole("PATIENT") // FHIR resource endpoints
                .requestMatchers("/api/messages/**").hasRole("PATIENT") // Messages inbox (legacy)
                .requestMatchers("/api/patient/messages/**").hasRole("PATIENT") // Messages inbox
                .requestMatchers("/api/patient/alerts/**").hasRole("PATIENT") // Alert dismissal
                .requestMatchers("/api/results/**").hasRole("PATIENT") // Lab results
                .requestMatchers("/api/meds/**").hasRole("PATIENT") // Medications
                .requestMatchers("/api/questionnaires/**").hasRole("PATIENT") // Questionnaires
                .requestMatchers("/api/billing/**").hasRole("PATIENT") // Billing
                
                // Staff/admin endpoints (require ADMIN or PROVIDER role)
                .requestMatchers("/api/patients").hasAnyRole("ADMIN", "PROVIDER")
                // Doctors/Providers: Allow PATIENT role to read (for MyChart provider selection)
                .requestMatchers("/api/doctors").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/doctors/{id}").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/doctors/{id}/image").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/doctors/{id}/availability").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                // Visit Types: Allow PATIENT role to read (for MyChart visit type selection)
                .requestMatchers("/api/visit-types").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/visit-types/{id}").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                // Provider endpoints (alias for /api/doctors) - accessible to PATIENT role
                .requestMatchers("/api/providers").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/providers/{id}").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/providers/{id}/image").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/providers/{id}/availability").hasAnyRole("ADMIN", "PROVIDER", "PATIENT")
                .requestMatchers("/api/appointments").hasAnyRole("ADMIN", "PROVIDER", "PATIENT") // PATIENT can see their own via /me
                .requestMatchers("/api/departments").hasAnyRole("ADMIN", "PROVIDER")
                .requestMatchers("/api/reports/**").hasAnyRole("ADMIN", "PROVIDER")
                .requestMatchers("/api/scheduling/**").hasAnyRole("ADMIN", "PROVIDER")
                .requestMatchers("/api/encounters").hasAnyRole("ADMIN", "PROVIDER")

                // AI knowledge ingest (vector index); ADMIN only
                .requestMatchers("/api/admin/ai/**").hasRole("ADMIN")
                
                // All other /api/** endpoints require authentication (any role)
                .requestMatchers("/api/**").authenticated()
                
                // Allow everything else (Swagger, static resources, etc.)
                .anyRequest().permitAll()
            );
        
        return http.build();
    }
}

