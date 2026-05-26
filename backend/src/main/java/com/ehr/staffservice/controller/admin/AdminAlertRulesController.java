package com.ehr.staffservice.controller.admin;

import com.ehr.staffservice.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Stub controller for admin alert rules so the admin UI does not get NoResourceFoundException.
 * Returns empty list for GET; other methods accept requests and return success.
 */
@RestController
@RequestMapping("/api/admin/alert-rules")
public class AdminAlertRulesController {

    @GetMapping
    public ResponseEntity<ApiResponse> getAlertRules() {
        return ResponseEntity.ok(ApiResponse.ok(Collections.emptyList(), "Alert rules retrieved"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createAlertRule(@RequestBody Map<String, Object> rule) {
        return ResponseEntity.ok(ApiResponse.ok(rule, "Alert rule created (stub)"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateAlertRule(@PathVariable Long id, @RequestBody Map<String, Object> rule) {
        return ResponseEntity.ok(ApiResponse.ok(rule, "Alert rule updated (stub)"));
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<ApiResponse> toggleAlertRule(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.ok(body, "Toggle applied (stub)"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlertRule(@PathVariable Long id) {
        return ResponseEntity.noContent().build();
    }
}
