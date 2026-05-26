package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.dto.DoctorWithAppointmentsDto;
import com.ehr.staffservice.dto.ProviderAvailabilityDto;
import com.ehr.staffservice.dto.ProviderValidationDto;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService service;
    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;

    @PostMapping
    public DoctorDto create(@Valid @RequestBody DoctorDto dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<DoctorDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DoctorDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public DoctorDto update(@PathVariable Long id,
                           @Valid @RequestBody DoctorDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}/appointments")
    public DoctorWithAppointmentsDto getDoctorWithAppointments(@PathVariable Long id) {
        return service.getDoctorWithAppointments(id);
    }

    @GetMapping("/{id}/validate")
    public ProviderValidationDto validateProvider(@PathVariable Long id) {
        return service.validateProvider(id);
    }

    /**
     * Get doctor image (photoUrl from database)
     * GET /api/doctors/{id}/image
     * Returns the image stored in the database
     * Handles:
     * - Base64 data URLs (data:image/...;base64,...) - extracts and returns binary
     * - Base64 strings without prefix - returns as image/jpeg
     * - Regular URLs - redirects to the URL
     */
    @GetMapping("/{id}/image")
    public ResponseEntity<?> getDoctorImage(@PathVariable Long id) {
        DoctorDto doctor = service.get(id);
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
                    byte[] imageBytes = Base64.getDecoder().decode(base64Data);
                    
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
                    
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.parseMediaType(contentType));
                    headers.setContentLength(imageBytes.length);
                    
                    return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
                }
            } catch (Exception e) {
                // If decoding fails, return 404
                return ResponseEntity.notFound().build();
            }
        }
        
        // If it's a regular HTTP/HTTPS URL, redirect to it
        if (photoUrl.startsWith("http://") || photoUrl.startsWith("https://")) {
            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(java.net.URI.create(photoUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND);
        }
        
        // If it's a long base64 string without prefix, assume it's base64 and decode it
        if (photoUrl.length() > 100) {
            try {
                byte[] imageBytes = Base64.getDecoder().decode(photoUrl);
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.IMAGE_JPEG);
                headers.setContentLength(imageBytes.length);
                return new ResponseEntity<>(imageBytes, headers, HttpStatus.OK);
            } catch (Exception e) {
                // If decoding fails, return 404
                return ResponseEntity.notFound().build();
            }
        }
        
        // If none of the above, return 404
        return ResponseEntity.notFound().build();
    }

    /**
     * Upload/update doctor photo
     * POST /api/doctors/{id}/photo
     * Saves photoUrl (base64 or URL) to database
     */
    @PostMapping("/{id}/photo")
    public ResponseEntity<DoctorDto> uploadPhoto(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        String photoUrl = request.get("photoUrl");
        if (photoUrl == null || photoUrl.trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        
        DoctorDto doctor = service.get(id);
        doctor.setPhotoUrl(photoUrl);
        DoctorDto updated = service.update(id, doctor);
        return ResponseEntity.ok(updated);
    }

    /**
     * Remove doctor photo
     * DELETE /api/doctors/{id}/photo
     */
    @DeleteMapping("/{id}/photo")
    public ResponseEntity<DoctorDto> removePhoto(@PathVariable Long id) {
        DoctorDto doctor = service.get(id);
        doctor.setPhotoUrl(null);
        DoctorDto updated = service.update(id, doctor);
        return ResponseEntity.ok(updated);
    }

    /**
     * GET /api/doctors/{doctorId}/availability?date=YYYY-MM-DD
     * Returns available 15-minute time slots for a doctor on a given date.
     * Excludes slots that overlap with existing appointments.
     * Accessible to PATIENT role for MyChart scheduling.
     * 
     * Default hours: 8:00 AM to 5:00 PM (8-17)
     * Slot interval: 15 minutes
     */
    @GetMapping("/{doctorId}/availability")
    public ResponseEntity<ProviderAvailabilityDto> getDoctorAvailability(
            @PathVariable Long doctorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        
        try {
            // Verify doctor exists
            if (!doctorRepository.existsById(doctorId)) {
                log.warn("Availability request for non-existent doctor: {}", doctorId);
                ProviderAvailabilityDto errorResponse = new ProviderAvailabilityDto();
                errorResponse.setProviderId(doctorId);
                errorResponse.setDate(date.format(DateTimeFormatter.ISO_DATE));
                errorResponse.setAvailableSlots(new ArrayList<>());
                errorResponse.setStartHour(8);
                errorResponse.setEndHour(17);
                return ResponseEntity.ok(errorResponse); // Return empty availability instead of error
            }
            
            // Default schedule: 8 AM to 5 PM
            int startHour = 8;
            int endHour = 17;
            int slotIntervalMinutes = 15;
            
            // Get all appointments for this doctor on this date
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.plusDays(1).atStartOfDay();
            
            List<com.ehr.staffservice.entity.Appointment> appointments = 
                appointmentRepository.findByDateRange(dayStart, dayEnd, List.of(doctorId), null);
        
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
            response.setProviderId(doctorId);
            response.setDate(date.format(DateTimeFormatter.ISO_DATE));
            response.setAvailableSlots(availableSlots);
            response.setStartHour(startHour);
            response.setEndHour(endHour);
            
            log.debug("Returning availability for doctor {} on {}: {} slots", doctorId, date, availableSlots.size());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting availability for doctor {} on date {}: {}", doctorId, date, e.getMessage(), e);
            // Return empty availability instead of error to prevent frontend from showing error
            ProviderAvailabilityDto errorResponse = new ProviderAvailabilityDto();
            errorResponse.setProviderId(doctorId);
            errorResponse.setDate(date.format(DateTimeFormatter.ISO_DATE));
            errorResponse.setAvailableSlots(new ArrayList<>());
            errorResponse.setStartHour(8);
            errorResponse.setEndHour(17);
            return ResponseEntity.ok(errorResponse);
        }
    }
}

