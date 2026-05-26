package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.RegistrationCompletenessDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientConsent;
import com.ehr.staffservice.repository.PatientConsentRepository;
import com.ehr.staffservice.repository.PatientRepository;
import com.ehr.staffservice.service.EnhancedRegistrationCompletenessService;
import com.ehr.staffservice.service.SessionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Patient Portal controller for MyChart.
 * Provides PATCH endpoints for updating patient registration data.
 */
@Slf4j
@RestController
@RequestMapping("/api/patient-portal")
@RequiredArgsConstructor
@PreAuthorize("hasRole('PATIENT')")
public class PatientPortalController {

    private final PatientRepository patientRepository;
    private final PatientConsentRepository consentRepository;
    private final EnhancedRegistrationCompletenessService completenessService;
    private final com.ehr.staffservice.service.DashboardService dashboardService;

    /**
     * GET /api/patient-portal/me/dashboard
     * Returns Epic-style dashboard data (alias for /api/patient/dashboard).
     */
    @GetMapping("/me/dashboard")
    public ResponseEntity<com.ehr.staffservice.dto.PatientDashboardDto> getDashboard(
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            return ResponseEntity.status(401).build();
        }

        com.ehr.staffservice.dto.PatientDashboardDto dashboard = dashboardService.getPatientDashboard(session.getPatientId());
        return ResponseEntity.ok(dashboard);
    }

    /**
     * PATCH /api/patient-portal/me/demographics
     * Update patient demographics (name, DOB, address, etc.)
     */
    @PatchMapping("/me/demographics")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateDemographics(
            @RequestBody DemographicsUpdateDto update,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            return ResponseEntity.status(401).build();
        }

        Patient patient = patientRepository.findById(session.getPatientId())
                .orElseThrow(() -> new com.ehr.staffservice.exception.ResourceNotFoundException(
                        "Patient not found"));

        // Update fields if provided
        if (update.getFirstName() != null) {
            patient.setFirstName(update.getFirstName());
        }
        if (update.getLastName() != null) {
            patient.setLastName(update.getLastName());
        }
        if (update.getDateOfBirth() != null) {
            patient.setDateOfBirth(update.getDateOfBirth());
        }
        if (update.getGender() != null) {
            patient.setGender(update.getGender());
        }
        if (update.getPhoneNumber() != null) {
            patient.setPhoneNumber(update.getPhoneNumber());
        }
        if (update.getEmail() != null) {
            patient.setEmail(update.getEmail());
        }
        if (update.getAddressLine1() != null) {
            patient.setAddressLine1(update.getAddressLine1());
        }
        if (update.getCity() != null) {
            patient.setCity(update.getCity());
        }
        if (update.getState() != null) {
            patient.setState(update.getState());
        }
        if (update.getZipCode() != null) {
            patient.setZipCode(update.getZipCode());
        }

        patientRepository.save(patient);

        // Recompute completeness
        RegistrationCompletenessDto completeness = completenessService.computeCompleteness(patient);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("completeness", completeness);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/patient-portal/me/contacts
     * Update patient contact information
     * TODO: Implement PatientContact entity updates
     */
    @PatchMapping("/me/contacts")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateContacts(
            @RequestBody ContactsUpdateDto update,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            return ResponseEntity.status(401).build();
        }

        Patient patient = patientRepository.findById(session.getPatientId())
                .orElseThrow(() -> new com.ehr.staffservice.exception.ResourceNotFoundException(
                        "Patient not found"));

        // TODO: Update PatientContact entities
        // For now, update patient table fields
        if (update.getPhoneNumber() != null) {
            patient.setPhoneNumber(update.getPhoneNumber());
        }
        if (update.getEmail() != null) {
            patient.setEmail(update.getEmail());
        }

        patientRepository.save(patient);

        RegistrationCompletenessDto completeness = completenessService.computeCompleteness(patient);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("completeness", completeness);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/patient-portal/me/insurance
     * Update patient insurance information
     * TODO: Implement Insurance entity updates
     */
    @PatchMapping("/me/insurance")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateInsurance(
            @RequestBody InsuranceUpdateDto update,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            return ResponseEntity.status(401).build();
        }

        Patient patient = patientRepository.findById(session.getPatientId())
                .orElseThrow(() -> new com.ehr.staffservice.exception.ResourceNotFoundException(
                        "Patient not found"));

        // TODO: Update Insurance entities
        // For now, update patient table fields
        if (update.getInsuranceProvider() != null) {
            patient.setInsuranceProvider(update.getInsuranceProvider());
        }
        if (update.getInsurancePolicyNumber() != null) {
            patient.setInsurancePolicyNumber(update.getInsurancePolicyNumber());
        }

        patientRepository.save(patient);

        RegistrationCompletenessDto completeness = completenessService.computeCompleteness(patient);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("completeness", completeness);
        return ResponseEntity.ok(response);
    }

    /**
     * PATCH /api/patient-portal/me/consents
     * Update patient consents
     */
    @PatchMapping("/me/consents")
    @Transactional
    public ResponseEntity<Map<String, Object>> updateConsents(
            @RequestBody ConsentsUpdateDto update,
            @RequestAttribute(value = "sessionData", required = false) SessionService.SessionData session) {
        
        if (session == null || session.getPatientId() == null) {
            return ResponseEntity.status(401).build();
        }

        Long patientId = session.getPatientId();

        // Update or create consents
        if (update.getGeneralConsent() != null) {
            PatientConsent consent = consentRepository.findByPatientIdAndConsentType(patientId, PatientConsent.TYPE_GENERAL)
                    .orElse(new PatientConsent());
            consent.setPatientId(patientId);
            consent.setConsentType(PatientConsent.TYPE_GENERAL);
            consent.setConsentSigned(update.getGeneralConsent());
            if (update.getGeneralConsent()) {
                consent.setStatus(PatientConsent.ConsentStatus.ACTIVE);
                consent.setAcceptedAt(LocalDateTime.now());
                consent.setAcceptedBy(PatientConsent.AcceptedBy.PATIENT);
                consent.setVersion("1.0");
                consent.setSignedBy("Patient Portal");
            }
            consentRepository.save(consent);
        }

        if (update.getHipaaConsent() != null) {
            PatientConsent consent = consentRepository.findByPatientIdAndConsentType(patientId, PatientConsent.TYPE_HIPAA)
                    .orElse(new PatientConsent());
            consent.setPatientId(patientId);
            consent.setConsentType(PatientConsent.TYPE_HIPAA);
            consent.setConsentSigned(update.getHipaaConsent());
            if (update.getHipaaConsent()) {
                consent.setStatus(PatientConsent.ConsentStatus.ACTIVE);
                consent.setAcceptedAt(LocalDateTime.now());
                consent.setAcceptedBy(PatientConsent.AcceptedBy.PATIENT);
                consent.setVersion("1.0");
                consent.setSignedBy("Patient Portal");
            }
            consentRepository.save(consent);
        }

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new com.ehr.staffservice.exception.ResourceNotFoundException(
                        "Patient not found"));

        RegistrationCompletenessDto completeness = completenessService.computeCompleteness(patient);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("completeness", completeness);
        return ResponseEntity.ok(response);
    }

    // DTOs for PATCH requests
    @Data
    public static class DemographicsUpdateDto {
        private String firstName;
        private String lastName;
        private LocalDate dateOfBirth;
        private String gender;
        private String phoneNumber;
        private String email;
        private String addressLine1;
        private String city;
        private String state;
        private String zipCode;
    }

    @Data
    public static class ContactsUpdateDto {
        private String phoneNumber;
        private String email;
    }

    @Data
    public static class InsuranceUpdateDto {
        private String insuranceProvider;
        private String insurancePolicyNumber;
    }

    @Data
    public static class ConsentsUpdateDto {
        private Boolean generalConsent;
        private Boolean hipaaConsent;
    }
}

