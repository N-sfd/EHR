package com.ehr.staffservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.regex.Pattern;

/**
 * CORS for credentialed {@code /api/**} calls from browser dev servers on arbitrary ports
 * ({@code http://localhost:55108}, etc.).
 * <p>
 * {@code allowedOriginPatterns("http://localhost:*")} does not reliably match host:port origins
 * in Spring's CORS check, which produced {@code 403} with {@code Origin: http://localhost:55108}.
 * We allow exact reflected origins when they match local dev hosts.
 */
@Configuration
public class CorsConfig {

    /**
     * {@code http://localhost:PORT}, {@code http://127.0.0.1:PORT}, {@code http://[::1]:PORT} (optional port).
     */
    private static final Pattern LOCAL_DEV_ORIGIN = Pattern.compile(
            "^https?://(localhost|127\\.0\\.0\\.1|\\[::1\\])(:\\d+)?$");

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        return request -> {
            String path = request.getRequestURI();
            String origin = request.getHeader(HttpHeaders.ORIGIN);

            CorsConfiguration cfg = new CorsConfiguration();
            cfg.setAllowedHeaders(List.of("*"));
            cfg.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
            cfg.setMaxAge(3600L);

            if (path.startsWith("/api")) {
                cfg.setAllowCredentials(true);
                if (origin != null && LOCAL_DEV_ORIGIN.matcher(origin).matches()) {
                    cfg.setAllowedOrigins(Collections.singletonList(origin));
                }
            } else {
                cfg.setAllowCredentials(false);
                cfg.setAllowedOrigins(Collections.singletonList("*"));
            }
            return cfg;
        };
    }
}
