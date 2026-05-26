package com.ehr.staffservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Handles GET / so the request is not passed to the static resource handler.
 * Avoids NoResourceFoundException when the backend root URL is opened directly (e.g. in browser).
 */
@RestController
public class RootController {

    @GetMapping("/")
    public ResponseEntity<Map<String, String>> root() {
        return ResponseEntity.ok(Map.of(
                "service", "Staff Service API",
                "health", "/api/health",
                "docs", "/swagger-ui.html"
        ));
    }
}
