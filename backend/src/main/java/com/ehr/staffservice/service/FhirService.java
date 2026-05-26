package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.fhir.FhirPatientDto;
import com.ehr.staffservice.dto.fhir.FhirCoverageDto;
import com.ehr.staffservice.dto.fhir.FhirConsentDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientAddress;
import com.ehr.staffservice.entity.PatientConsent;
import com.ehr.staffservice.entity.patientaccess.Coverage;
import com.ehr.staffservice.repository.PatientRepository;
import com.ehr.staffservice.repository.PatientAddressRepository;
import com.ehr.staffservice.repository.PatientConsentRepository;
import com.ehr.staffservice.repository.patientaccess.CoverageRepository;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

/**
 * Service for handling FHIR resource operations.
 * Maps between FHIR DTOs and internal entities.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FhirService {

    private final PatientRepository patientRepository;
    private final PatientAddressRepository addressRepository;
    private final CoverageRepository coverageRepository;
    private final PatientConsentRepository consentRepository;
    private final FhirMappingService fhirMappingService;

    /**
     * Update Patient resource (partial update).
     * Updates address and telecom (phone/email) fields.
     */
    @Transactional
    public FhirPatientDto updatePatient(Long patientId, FhirPatientDto fhirPatient) {
        log.info("Updating Patient resource for patientId: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Update telecom (phone/email)
        if (fhirPatient.getTelecom() != null) {
            for (FhirPatientDto.ContactPoint telecom : fhirPatient.getTelecom()) {
                if ("phone".equals(telecom.getSystem()) && telecom.getValue() != null) {
                    patient.setPhoneNumber(telecom.getValue());
                } else if ("email".equals(telecom.getSystem()) && telecom.getValue() != null) {
                    patient.setEmail(telecom.getValue());
                }
            }
            patientRepository.save(patient);
        }

        // Update address
        if (fhirPatient.getAddress() != null && !fhirPatient.getAddress().isEmpty()) {
            FhirPatientDto.Address fhirAddress = fhirPatient.getAddress().get(0);
            
            List<PatientAddress> existingAddresses = addressRepository.findByPatientIdAndIsPrimary(patientId, true);
            PatientAddress address;
            
            if (!existingAddresses.isEmpty()) {
                address = existingAddresses.get(0);
            } else {
                address = new PatientAddress();
                address.setPatientId(patientId);
                address.setIsPrimary(true);
            }

            if (fhirAddress.getLine() != null && !fhirAddress.getLine().isEmpty()) {
                address.setAddressLine1(fhirAddress.getLine().get(0));
                if (fhirAddress.getLine().size() > 1) {
                    address.setAddressLine2(fhirAddress.getLine().get(1));
                }
            }
            address.setCity(fhirAddress.getCity());
            address.setStateProvince(fhirAddress.getState());
            address.setPostalCode(fhirAddress.getPostalCode());
            address.setCountry(fhirAddress.getCountry() != null ? fhirAddress.getCountry() : "US");

            addressRepository.save(address);
        }

        // Return updated FHIR resource
        List<PatientAddress> addresses = addressRepository.findByPatientIdAndIsPrimary(patientId, true);
        PatientAddress primaryAddress = addresses.isEmpty() ? null : addresses.get(0);
        
        return fhirMappingService.toFhirPatient(patient, primaryAddress, null);
    }

    /**
     * Create or update Coverage resource (upsert).
     */
    @Transactional
    public FhirCoverageDto upsertCoverage(Long patientId, FhirCoverageDto fhirCoverage) {
        log.info("Upserting Coverage resource for patientId: {}", patientId);

        // Check if coverage exists (by subscriberId/memberId)
        Optional<Coverage> existing = coverageRepository.findByPatientId(patientId).stream()
                .filter(c -> c.getMemberId().equals(fhirCoverage.getSubscriberId()))
                .findFirst();

        Coverage coverage;
        if (existing.isPresent()) {
            coverage = existing.get();
        } else {
            coverage = new Coverage();
            coverage.setPatientId(patientId);
        }

        // Update from FHIR
        if (fhirCoverage.getPayor() != null && !fhirCoverage.getPayor().isEmpty()) {
            coverage.setPayer(fhirCoverage.getPayor().get(0).getDisplay());
        }
        coverage.setMemberId(fhirCoverage.getSubscriberId());
        if (fhirCoverage.getPeriod() != null) {
            coverage.setStartDate(fhirCoverage.getPeriod().getStart());
            coverage.setEndDate(fhirCoverage.getPeriod().getEnd());
        }
        if (fhirCoverage.getOrder() != null) {
            coverage.setIsPrimary(fhirCoverage.getOrder() == 1);
        }
        
        // Extract group number from class
        if (fhirCoverage.getClassList() != null) {
            for (FhirCoverageDto.Class clazz : fhirCoverage.getClassList()) {
                if (clazz.getType() != null && "group".equals(clazz.getType().getText())) {
                    coverage.setGroupNumber(clazz.getValue());
                    break;
                }
            }
        }

        coverage = coverageRepository.save(coverage);
        return fhirMappingService.toFhirCoverage(coverage);
    }

    /**
     * Update existing Coverage resource.
     */
    @Transactional
    public FhirCoverageDto updateCoverage(String coverageId, Long patientId, FhirCoverageDto fhirCoverage) {
        // Extract numeric ID from FHIR ID (e.g., "cov1" -> 1)
        Long id = Long.parseLong(coverageId.replaceAll("[^0-9]", ""));
        
        Coverage existingCoverage = coverageRepository.findById(id)
                .filter(c -> c.getPatientId().equals(patientId))
                .orElseThrow(() -> new ResourceNotFoundException("Coverage not found with ID: " + id));

        // Update from FHIR (same logic as upsert)
        return upsertCoverage(patientId, fhirCoverage);
    }

    /**
     * Get Patient resource by ID.
     */
    @Transactional(readOnly = true)
    public FhirPatientDto getPatient(Long patientId) {
        log.info("Getting Patient resource for patientId: {}", patientId);

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        List<PatientAddress> addresses = addressRepository.findByPatientIdAndIsPrimary(patientId, true);
        PatientAddress primaryAddress = addresses.isEmpty() ? null : addresses.get(0);
        
        List<com.ehr.staffservice.entity.PatientContact> emergencyContacts = null;
        try {
            emergencyContacts = fhirMappingService.getEmergencyContacts(patientId);
        } catch (Exception e) {
            log.warn("Error fetching emergency contacts: {}", e.getMessage());
        }

        return fhirMappingService.toFhirPatient(patient, primaryAddress, emergencyContacts);
    }

    /**
     * Get Coverage resources for a patient with optional status filter.
     */
    @Transactional(readOnly = true)
    public List<FhirCoverageDto> getCoverages(Long patientId, String status) {
        log.info("Getting Coverage resources for patientId: {}, status: {}", patientId, status);

        List<Coverage> coverages = coverageRepository.findByPatientId(patientId);
        
        // Filter by status if provided
        if (status != null && !status.isEmpty()) {
            String statusUpper = status.toUpperCase();
            if ("ACTIVE".equals(statusUpper)) {
                coverages = coverages.stream()
                        .filter(c -> c.getEligibilityStatus() == Coverage.EligibilityStatus.ACTIVE)
                        .collect(java.util.stream.Collectors.toList());
            }
        }

        return coverages.stream()
                .map(fhirMappingService::toFhirCoverage)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Get Consent resources for a patient with optional status filter.
     */
    @Transactional(readOnly = true)
    public List<FhirConsentDto> getConsents(Long patientId, String status) {
        log.info("Getting Consent resources for patientId: {}, status: {}", patientId, status);

        List<PatientConsent> consents;
        if (status != null && "active".equalsIgnoreCase(status)) {
            consents = consentRepository.findByPatientIdAndConsentSigned(patientId, true);
        } else {
            consents = consentRepository.findByPatientId(patientId);
        }

        return consents.stream()
                .map(fhirMappingService::toFhirConsent)
                .collect(java.util.stream.Collectors.toList());
    }

    /**
     * Create Consent resource.
     */
    @Transactional
    public FhirConsentDto createConsent(Long patientId, FhirConsentDto fhirConsent) {
        log.info("Creating Consent resource for patientId: {}", patientId);

        // Extract consent type from category
        String consentType = "General Consent";
        if (fhirConsent.getCategory() != null && !fhirConsent.getCategory().isEmpty()) {
            consentType = fhirConsent.getCategory().get(0).getText();
        }

        // Check if consent already exists
        Optional<PatientConsent> existing = consentRepository.findByPatientIdAndConsentType(patientId, consentType);

        PatientConsent consent;
        if (existing.isPresent()) {
            consent = existing.get();
        } else {
            consent = new PatientConsent();
            consent.setPatientId(patientId);
            consent.setConsentType(consentType);
        }

        // Update status
        if ("active".equalsIgnoreCase(fhirConsent.getStatus())) {
            consent.setStatus(PatientConsent.ConsentStatus.ACTIVE);
            consent.setConsentSigned(true);
        } else {
            consent.setStatus(PatientConsent.ConsentStatus.REVOKED);
            consent.setConsentSigned(false);
        }
        
        // Update acceptedAt
        if (fhirConsent.getDateTime() != null) {
            consent.setAcceptedAt(fhirConsent.getDateTime()
                    .atZone(java.time.ZoneId.systemDefault()).toLocalDateTime());
        } else {
            consent.setAcceptedAt(java.time.LocalDateTime.now());
        }
        
        // Update version
        if (fhirConsent.getVersion() != null) {
            consent.setVersion(fhirConsent.getVersion());
        } else {
            consent.setVersion("1.0");
        }
        
        // Update acceptedBy (default to PATIENT for eCheck-in)
        consent.setAcceptedBy(PatientConsent.AcceptedBy.PATIENT);
        consent.setSignedBy("Patient (eCheck-in)");

        consent = consentRepository.save(consent);
        return fhirMappingService.toFhirConsent(consent);
    }
}

