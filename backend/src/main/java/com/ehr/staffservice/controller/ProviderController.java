package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.dto.ProviderAvailabilityDto;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Provider Controller - Alias for /api/doctors
 * Provides MyChart-compatible endpoint names while using the same backend data.
 * All endpoints are read-only for PATIENT role (write operations require ADMIN/PROVIDER).
 */
@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final DoctorService doctorService;
    private final AppointmentRepository appointmentRepository;

    /**
     * GET /api/providers
     * Returns all providers (same as /api/doctors).
     * Accessible to PATIENT role for MyChart provider selection.
     */
    @GetMapping
    public ResponseEntity<List<DoctorDto>> getAllProviders() {
        List<DoctorDto> providers = doctorService.getAll();
        return ResponseEntity.ok(providers);
    }

    /**
     * GET /api/providers/{id}
     * Returns a specific provider by ID (same as /api/doctors/{id}).
     * Accessible to PATIENT role.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DoctorDto> getProvider(@PathVariable Long id) {
        DoctorDto provider = doctorService.get(id);
        return ResponseEntity.ok(provider);
    }

    /**
     * GET /api/providers/{id}/image
     * Returns provider image (same as /api/doctors/{id}/image).
     * Accessible to PATIENT role.
     */
    @GetMapping("/{id}/image")
    public ResponseEntity<?> getProviderImage(@PathVariable Long id) {
        DoctorDto doctor = doctorService.get(id);
        String photoUrl = doctor.getPhotoUrl();
        
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        // If it's a data URL (data:image/...;base64,...), extract and return binary
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
                    
                    return new ResponseEntity<>(imageBytes, headers, org.springframework.http.HttpStatus.OK);
                }
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        
        // If it's a regular HTTP/HTTPS URL, redirect to it
        if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setLocation(java.net.URI.create(photoUrl));
            return new ResponseEntity<>(headers, org.springframework.http.HttpStatus.FOUND);
        }
        
        // If it's a long base64 string without prefix, assume it's base64 and decode it
        if (photoUrl.length() > 100) {
            try {
                byte[] imageBytes = java.util.Base64.getDecoder().decode(photoUrl);
                org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
                headers.setContentType(org.springframework.http.MediaType.IMAGE_JPEG);
                headers.setContentLength(imageBytes.length);
                return new ResponseEntity<>(imageBytes, headers, org.springframework.http.HttpStatus.OK);
            } catch (Exception e) {
                return ResponseEntity.notFound().build();
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    /**
     * GET /api/providers/{providerId}/availability?date=YYYY-MM-DD
     * Returns available 15-minute time slots for a provider on a given date.
     * Excludes slots that overlap with existing appointments.
     * Accessible to PATIENT role.
     * 
     * Default hours: 8:00 AM to 5:00 PM (8-17)
     * Slot interval: 15 minutes
     */
    @GetMapping("/{providerId}/availability")
    public ResponseEntity<ProviderAvailabilityDto> getProviderAvailability(
            @PathVariable Long providerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        // Default schedule: 8 AM to 5 PM
        int startHour = 8;
        int endHour = 17;
        int slotIntervalMinutes = 15;
        
        // Get all appointments for this provider on this date
        LocalDateTime dayStart = date.atStartOfDay();
        LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
        
        List<com.ehr.staffservice.entity.Appointment> appointments = 
            appointmentRepository.findByDateRange(dayStart, dayEnd, List.of(providerId), null);
        
        // Build set of occupied time slots (15-minute intervals)
        Set<LocalTime> occupiedSlots = appointments.stream()
            .filter(apt -> apt.getStatus() != null && 
                          !apt.getStatus().equals("CANCELLED") && 
                          !apt.getStatus().equals("NO_SHOW"))
            .flatMap(apt -> {
                // Generate all 15-minute slots covered by this appointment
                LocalTime aptStart = apt.getStartAt().toLocalTime();
                LocalTime aptEnd = apt.getEndAt().toLocalTime();
                List<LocalTime> slots = new ArrayList<>();
                LocalTime current = aptStart;
                while (current.isBefore(aptEnd)) {
                    slots.add(current);
                    current = current.plusMinutes(slotIntervalMinutes);
                }
                return slots.stream();
            })
            .collect(Collectors.toSet());
        
        // Generate all available slots (8 AM to 5 PM, 15-minute intervals)
        List<String> availableSlots = new ArrayList<>();
        LocalTime current = LocalTime.of(startHour, 0);
        LocalTime endTime = LocalTime.of(endHour, 0);
        
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");
        
        while (current.isBefore(endTime)) {
            if (!occupiedSlots.contains(current)) {
                availableSlots.add(current.format(timeFormatter));
            }
            current = current.plusMinutes(slotIntervalMinutes);
        }
        
        ProviderAvailabilityDto response = new ProviderAvailabilityDto();
        response.setProviderId(providerId);
        response.setDate(date.format(DateTimeFormatter.ISO_DATE));
        response.setAvailableSlots(availableSlots);
        response.setStartHour(startHour);
        response.setEndHour(endHour);
        
        return ResponseEntity.ok(response);
    }
}

