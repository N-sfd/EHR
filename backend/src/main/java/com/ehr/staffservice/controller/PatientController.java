package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PatientDto;
import com.ehr.staffservice.service.PatientService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService service;
    private final EntityManager entityManager;
    private final ObjectMapper objectMapper;

    @PostMapping
    public ResponseEntity<PatientDto> create(@Valid @RequestBody PatientDto dto) {
        PatientDto created = service.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public ResponseEntity<List<PatientDto>> getAll(
            @RequestParam(required = false) String query) {
        String correlationId = MDC.get("correlationId");
        String requestPath = "/api/patients";
        
        try {
            log.info("[CorrelationId: {}] GET {} - query: {}", correlationId, requestPath, query != null ? query : "all");
            
            List<PatientDto> patients;
            if (query != null && !query.trim().isEmpty()) {
                patients = service.searchPatients(query.trim());
                if (patients == null) {
                    patients = Collections.emptyList();
                }
                log.info("[CorrelationId: {}] GET {} - Search for '{}' returned {} patients", 
                        correlationId, requestPath, query, patients.size());
            } else {
                patients = service.getAll();
                if (patients == null) {
                    patients = Collections.emptyList();
                }
                log.info("[CorrelationId: {}] GET {} - Retrieved {} patients", correlationId, requestPath, patients.size());
            }
            
            // Log sample patient data for debugging (first patient only)
            if (!patients.isEmpty()) {
                PatientDto sample = patients.get(0);
                log.debug("[CorrelationId: {}] GET {} - Sample patient: id={}, code={}, name={} {}, email={}, phone={}", 
                        correlationId, requestPath, 
                        sample.getPatientId(), sample.getPatientCode(),
                        sample.getFirstName(), sample.getLastName(),
                        sample.getEmail(), sample.getPhoneNumber());
            }
            
            return ResponseEntity.ok(patients);
        } catch (Exception e) {
            log.error("[CorrelationId: {}] GET {} - Error retrieving patients: {} - Message: {}", 
                    correlationId, requestPath, e.getClass().getSimpleName(), e.getMessage(), e);
            throw e; // Let GlobalExceptionHandler handle it
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.get(id));
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<PatientDto> getByPatientCode(@PathVariable String code) {
        return ResponseEntity.ok(service.getByPatientCode(code));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDto> update(@PathVariable Long id,
                                            @RequestBody PatientDto dto) {
        String correlationId = MDC.get("correlationId");
        String requestPath = "/api/patients/" + id;
        
        try {
            // Log request payload for debugging
            String payloadJson = objectMapper.writeValueAsString(dto);
            log.info("[CorrelationId: {}] PUT {} - Request payload: {}", correlationId, requestPath, payloadJson);
            
            // Validate ID
            if (id == null || id <= 0) {
                log.warn("[CorrelationId: {}] PUT {} - Invalid patient ID: {}", correlationId, requestPath, id);
                throw new IllegalArgumentException("Invalid patient ID: " + id);
            }
            
            // Validate DTO is not null
            if (dto == null) {
                log.warn("[CorrelationId: {}] PUT {} - Request body is null", correlationId, requestPath);
                throw new IllegalArgumentException("Request body cannot be null");
            }
            
            // Service method handles loading existing patient, validation, and safe updates
            PatientDto updated = service.update(id, dto);
            
            log.info("[CorrelationId: {}] PUT {} - Successfully updated patient: {}", 
                    correlationId, requestPath, updated.getPatientId());
            
            return ResponseEntity.ok(updated);
            
        } catch (com.ehr.staffservice.exception.ResourceNotFoundException e) {
            log.warn("[CorrelationId: {}] PUT {} - Patient not found: {}", correlationId, requestPath, e.getMessage());
            throw e; // Let GlobalExceptionHandler return 404
        } catch (com.ehr.staffservice.exception.DuplicateResourceException e) {
            log.warn("[CorrelationId: {}] PUT {} - Duplicate resource: {}", correlationId, requestPath, e.getMessage());
            throw e; // Let GlobalExceptionHandler return 409
        } catch (IllegalArgumentException e) {
            log.warn("[CorrelationId: {}] PUT {} - Invalid argument: {}", correlationId, requestPath, e.getMessage());
            throw e; // Let GlobalExceptionHandler return 400
        } catch (Exception e) {
            log.error("[CorrelationId: {}] PUT {} - Unexpected error updating patient: {} - Message: {}", 
                    correlationId, requestPath, e.getClass().getSimpleName(), e.getMessage(), e);
            throw new RuntimeException("Failed to update patient: " + e.getMessage(), e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/photo")
    public ResponseEntity<PatientDto> uploadPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String photoUrl = request.get("photoUrl");
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        PatientDto patient = service.get(id);
        patient.setPhotoUrl(photoUrl);
        PatientDto updated = service.update(id, patient);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}/photo")
    public ResponseEntity<PatientDto> removePhoto(@PathVariable Long id) {
        PatientDto patient = service.get(id);
        patient.setPhotoUrl(null);
        PatientDto updated = service.update(id, patient);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        PatientDto patient = service.get(id);
        String photoUrl = patient.getPhotoUrl();
        
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // Handle data URLs (data:image/jpeg;base64,...)
        if (photoUrl.startsWith("data:image")) {
            try {
                String[] parts = photoUrl.split(",");
                if (parts.length == 2) {
                    String base64Data = parts[1];
                    byte[] imageBytes = java.util.Base64.getDecoder().decode(base64Data);
                    
                    // Extract content type from data URL
                    String contentType = "image/jpeg"; // default
                    String headerPart = parts[0];
                    if (headerPart.contains("image/png")) {
                        contentType = "image/png";
                    } else if (headerPart.contains("image/gif")) {
                        contentType = "image/gif";
                    } else if (headerPart.contains("image/webp")) {
                        contentType = "image/webp";
                    }
                    
                    org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                    headers.setContentType(org.springframework.http.MediaType.parseMediaType(contentType));
                    headers.setContentLength(imageBytes.length);
                    
                    return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                }
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        
        // If it's a regular HTTP/HTTPS URL, redirect to it
        if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setLocation(java.net.URI.create(photoUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
        
        // If it's a long base64 string without prefix, assume it's base64 and decode it
        if (photoUrl.length() > 100) {
            try {
                byte[] imageBytes = java.util.Base64.getDecoder().decode(photoUrl);
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.IMAGE_JPEG);
                headers.setContentLength(imageBytes.length);
                return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/consent")
    public ResponseEntity<Map<String, Object>> getConsent(@PathVariable Long id) {
        Map<String, Object> consent = new HashMap<>();
        consent.put("patientId", id);
        
        try {
            Query query = entityManager.createNativeQuery(
                "SELECT consent_signed, consent_date, consent_type, signed_by " +
                "FROM patient_consents " +
                "WHERE patient_id = :patientId AND consent_signed = true " +
                "ORDER BY consent_date DESC LIMIT 1"
            );
            query.setParameter("patientId", id);
            
            @SuppressWarnings("unchecked")
            List<Object[]> results = query.getResultList();
            
            if (!results.isEmpty()) {
                Object[] result = results.get(0);
                consent.put("consentSigned", result[0] != null ? (Boolean) result[0] : false);
                consent.put("consentDate", result[1] != null ? result[1].toString() : null);
                consent.put("consentType", result[2] != null ? result[2].toString() : "General Consent");
                consent.put("signedBy", result[3] != null ? result[3].toString() : null);
            } else {
                // No consent found
                consent.put("consentSigned", false);
                consent.put("consentDate", null);
                consent.put("consentType", "General Consent");
                consent.put("signedBy", null);
            }
        } catch (Exception e) {
            // If query fails, return default (not signed)
            consent.put("consentSigned", false);
            consent.put("consentDate", null);
            consent.put("consentType", "General Consent");
            consent.put("signedBy", null);
        }
        
        return ResponseEntity.ok(consent);
    }
}

