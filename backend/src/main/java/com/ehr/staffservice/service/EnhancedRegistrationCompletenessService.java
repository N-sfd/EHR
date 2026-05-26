package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.RegistrationCompletenessDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientAddress;
import com.ehr.staffservice.entity.PatientContact;
import com.ehr.staffservice.entity.PatientConsent;
import com.ehr.staffservice.repository.PatientAddressRepository;
import com.ehr.staffservice.repository.PatientContactRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Enhanced Registration Completeness Service with weighted sections (Epic-style).
 * 
 * Section weights:
 * - Demographics: 25%
 * - Contact & Communication: 15%
 * - Emergency Contact: 10%
 * - Insurance: 25%
 * - Guarantor / Billing Party: 10%
 * - Consent & Privacy: 10%
 * - Clinical Basics: 5%
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EnhancedRegistrationCompletenessService {

    private final PatientAddressRepository addressRepository;
    private final PatientContactRepository contactRepository;
    private final com.ehr.staffservice.repository.InsuranceRepository insuranceRepository;
    private final com.ehr.staffservice.repository.PatientConsentRepository consentRepository;

    // Section weights (must sum to 100)
    private static final int WEIGHT_DEMOGRAPHICS = 25;
    private static final int WEIGHT_CONTACT = 15;
    private static final int WEIGHT_EMERGENCY = 10;
    private static final int WEIGHT_INSURANCE = 25;
    private static final int WEIGHT_GUARANTOR = 10;
    private static final int WEIGHT_CONSENTS = 10;
    private static final int WEIGHT_CLINICAL = 5;

    /**
     * Compute comprehensive registration completeness with weighted sections.
     */
    @Transactional(readOnly = true)
    public RegistrationCompletenessDto computeCompleteness(Patient patient) {
        if (patient == null) {
            log.error("Patient is null in computeCompleteness");
            throw new IllegalArgumentException("Patient cannot be null");
        }
        
        if (patient.getPatientId() == null) {
            log.error("Patient ID is null in computeCompleteness");
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        
        List<RegistrationCompletenessDto.MissingFieldDto> missingFields = new ArrayList<>();
        List<RegistrationCompletenessDto.SectionCompletenessDto> sections = new ArrayList<>();
        Set<String> blockingFlags = new HashSet<>();

        // Get related data
        List<PatientAddress> addresses = new ArrayList<>();
        try {
            addresses = addressRepository.findByPatientIdAndIsPrimary(patient.getPatientId(), true);
        } catch (Exception e) {
            log.warn("Error fetching addresses for completeness: {}", e.getMessage());
        }
        PatientAddress primaryAddress = addresses.isEmpty() ? null : addresses.get(0);
        
        List<PatientContact> emergencyContacts = new ArrayList<>();
        try {
            emergencyContacts = contactRepository.findByPatientIdAndIsEmergencyContact(
                    patient.getPatientId(), true);
        } catch (Exception e) {
            log.warn("Error fetching emergency contacts for completeness: {}", e.getMessage());
        }

        // 1. DEMOGRAPHICS (25% weight)
        int demographicsPercent = computeDemographicsSection(patient, primaryAddress, missingFields);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "DEMOGRAPHICS", demographicsPercent, true, WEIGHT_DEMOGRAPHICS));

        // 2. CONTACT & COMMUNICATION (15% weight)
        int contactPercent = computeContactSection(patient, primaryAddress, missingFields);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "CONTACT", contactPercent, true, WEIGHT_CONTACT));

        // 3. EMERGENCY CONTACT (10% weight)
        int emergencyPercent = computeEmergencySection(patient, emergencyContacts, missingFields);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "EMERGENCY", emergencyPercent, true, WEIGHT_EMERGENCY));

        // 4. INSURANCE (25% weight)
        int insurancePercent = computeInsuranceSection(patient, missingFields, blockingFlags);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "INSURANCE", insurancePercent, true, WEIGHT_INSURANCE));

        // 5. GUARANTOR / BILLING PARTY (10% weight)
        int guarantorPercent = computeGuarantorSection(patient, missingFields);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "GUARANTOR", guarantorPercent, false, WEIGHT_GUARANTOR));

        // 6. CONSENTS & PRIVACY (10% weight)
        int consentsPercent = computeConsentsSection(patient, missingFields, blockingFlags);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "CONSENTS", consentsPercent, true, WEIGHT_CONSENTS));

        // 7. CLINICAL BASICS (5% weight) - Optional but recommended
        int clinicalPercent = computeClinicalSection(patient, missingFields);
        sections.add(new RegistrationCompletenessDto.SectionCompletenessDto(
                "CLINICAL_BASICS", clinicalPercent, false, WEIGHT_CLINICAL));

        // Calculate overall percent (weighted average)
        int overallPercent = calculateWeightedPercent(sections);

        // Determine status
        RegistrationCompletenessDto.CompletenessStatus status = determineStatus(
                overallPercent, missingFields, blockingFlags);

        return new RegistrationCompletenessDto(
                overallPercent,
                status,
                sections,
                missingFields,
                new ArrayList<>(blockingFlags)
        );
    }

    private int computeDemographicsSection(Patient patient, PatientAddress address, 
                                           List<RegistrationCompletenessDto.MissingFieldDto> missing) {
        int totalFields = 8;
        int completed = 0;

        // Legal Name (First + Last)
        if (patient.getFirstName() != null && !patient.getFirstName().trim().isEmpty() &&
            patient.getLastName() != null && !patient.getLastName().trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "legalName", 
                    "CRITICAL", "Required for billing statements and identity verification",
                    "/profile/personal?focus=firstName"));
        }

        // Date of Birth
        if (patient.getDateOfBirth() != null) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "dateOfBirth", 
                    "CRITICAL", "Required for billing and clinical safety",
                    "/profile/personal?focus=dateOfBirth"));
        }

        // Birth Sex
        if (patient.getGender() != null && !patient.getGender().trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "birthSex", 
                    "WARNING", "Recommended for clinical care",
                    "/profile/personal?focus=gender"));
        }

        // Address fields (4 fields)
        String addressLine1 = address != null ? address.getAddressLine1() : patient.getAddressLine1();
        String city = address != null ? address.getCity() : patient.getCity();
        String state = address != null ? address.getStateProvince() : patient.getState();
        String zip = address != null ? address.getPostalCode() : patient.getZipCode();

        // Address fields - CRITICAL for billing (Epic rule: blocks claim generation)
        if (addressLine1 != null && !addressLine1.trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "addressLine1", 
                    "CRITICAL", "Required for billing statements and claim generation",
                    "/profile/personal?focus=addressLine1"));
        }

        if (city != null && !city.trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "city", 
                    "CRITICAL", "Required for billing statements and claim generation",
                    "/profile/personal?focus=city"));
        }

        if (state != null && !state.trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "state", 
                    "CRITICAL", "Required for billing statements and claim generation",
                    "/profile/personal?focus=state"));
        }

        if (zip != null && !zip.trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("DEMOGRAPHICS", "zip", 
                    "CRITICAL", "Required for billing statements and claim generation",
                    "/profile/personal?focus=zip"));
        }

        return Math.round((completed * 100) / totalFields);
    }

    private int computeContactSection(Patient patient, PatientAddress address,
                                     List<RegistrationCompletenessDto.MissingFieldDto> missing) {
        int totalFields = 3;
        int completed = 0;

        // Phone Number
        if (patient.getPhoneNumber() != null && !patient.getPhoneNumber().trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("CONTACT", "phoneNumber", 
                    "CRITICAL", "Required for appointment reminders and communication",
                    "/profile/personal?focus=phoneNumber"));
        }

        // Email
        if (patient.getEmail() != null && !patient.getEmail().trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("CONTACT", "email", 
                    "WARNING", "Recommended for appointment confirmations and results",
                    "/profile/personal?focus=email"));
        }

        // Preferred Language (from demographics if available)
        // For now, we'll count this as optional
        completed++; // Assume present if not critical

        return Math.round((completed * 100) / totalFields);
    }

    private int computeEmergencySection(Patient patient, List<PatientContact> emergencyContacts,
                                       List<RegistrationCompletenessDto.MissingFieldDto> missing) {
        // Check if emergency contact exists
        if (emergencyContacts != null && !emergencyContacts.isEmpty()) {
            PatientContact ec = emergencyContacts.get(0);
            int totalFields = 3;
            int completed = 0;

            if (ec.getFirstName() != null && ec.getLastName() != null) {
                completed++;
            }
            if (ec.getMobilePhone() != null || ec.getHomePhone() != null) {
                completed++;
            }
            if (ec.getRelationship() != null) {
                completed++;
            }

            if (completed < totalFields) {
                missing.add(createMissingField("EMERGENCY", "emergencyContact", 
                        "WARNING", "Recommended for clinical safety",
                        "/profile/care-team?focus=emergency"));
            }

            return Math.round((completed * 100) / totalFields);
        } else {
            // Fallback to patient table emergency contact fields
            if (patient.getEmergencyContactName() != null && patient.getEmergencyContactPhone() != null) {
                return 100;
            } else {
                missing.add(createMissingField("EMERGENCY", "emergencyContact", 
                        "CRITICAL", "Required for clinical safety and visit arrival",
                        "/profile/care-team?focus=emergency"));
                // Epic rule: Emergency contact is critical for safety
                return 0;
            }
        }
    }

    private int computeInsuranceSection(Patient patient, 
                                       List<RegistrationCompletenessDto.MissingFieldDto> missing,
                                       Set<String> blockingFlags) {
        int totalFields = 4;
        int completed = 0;

        // Check Insurance entity (insurances table) first, then fallback to patient table
        com.ehr.staffservice.entity.Insurance primaryInsurance = null;
        try {
            if (insuranceRepository != null && patient.getPatientId() != null) {
                primaryInsurance = insuranceRepository.findByPatientIdAndIsPrimaryTrue(patient.getPatientId())
                        .orElse(null);
            }
        } catch (Exception e) {
            log.warn("Error fetching insurance for completeness: {}", e.getMessage());
        }

        // Primary Insurance Payer
        String payerName = null;
        if (primaryInsurance != null && primaryInsurance.getInsuranceName() != null) {
            payerName = primaryInsurance.getInsuranceName();
        } else if (patient.getInsuranceProvider() != null && !patient.getInsuranceProvider().trim().isEmpty()) {
            payerName = patient.getInsuranceProvider();
        }

        // Primary Insurance Payer - CRITICAL (Epic rule: blocks claim generation)
        if (payerName != null && !payerName.trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("INSURANCE", "primaryInsurancePayer", 
                    "CRITICAL", "Required for billing claims and claim generation",
                    "/profile/coverage?focus=insuranceProvider"));
            blockingFlags.add("BILLING_BLOCK");
            blockingFlags.add("CLAIM_GENERATION_BLOCK");
        }

        // Member ID / Policy Number - CRITICAL (Epic rule: blocks claim generation)
        String memberId = null;
        if (primaryInsurance != null) {
            memberId = primaryInsurance.getPolicyNumber() != null ? primaryInsurance.getPolicyNumber() 
                    : primaryInsurance.getSubscriberId();
        } else if (patient.getInsurancePolicyNumber() != null) {
            memberId = patient.getInsurancePolicyNumber();
        }

        if (memberId != null && !memberId.trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("INSURANCE", "memberId", 
                    "CRITICAL", "Required for billing claims and claim generation",
                    "/profile/coverage?focus=insurancePolicyNumber"));
            blockingFlags.add("BILLING_BLOCK");
            blockingFlags.add("CLAIM_GENERATION_BLOCK");
        }

        // Subscriber Name - CRITICAL (Epic rule: required for claims)
        String subscriberName = null;
        if (primaryInsurance != null && primaryInsurance.getSubscriberName() != null) {
            subscriberName = primaryInsurance.getSubscriberName();
        }
        
        if (subscriberName != null && !subscriberName.trim().isEmpty()) {
            completed++;
        } else {
            // If subscriber name is missing, assume same as patient (acceptable fallback)
            if (patient.getFirstName() != null && patient.getLastName() != null) {
                completed++;
            } else {
                missing.add(createMissingField("INSURANCE", "subscriberName", 
                        "CRITICAL", "Required for billing claims",
                        "/profile/coverage?focus=subscriberName"));
                blockingFlags.add("CLAIM_GENERATION_BLOCK");
            }
        }

        // Effective Dates (optional but recommended)
        if (primaryInsurance != null && primaryInsurance.getEffectiveDate() != null) {
            completed++;
        } else {
            // Optional - count as complete for now
            completed++;
        }

        return Math.round((completed * 100) / totalFields);
    }

    private int computeGuarantorSection(Patient patient, 
                                       List<RegistrationCompletenessDto.MissingFieldDto> missing) {
        // For now, assume patient is self-pay or guarantor info is optional
        // In a full implementation, you'd check patient_guarantor table
        return 100; // Optional section
    }

    private int computeConsentsSection(Patient patient,
                                      List<RegistrationCompletenessDto.MissingFieldDto> missing,
                                      Set<String> blockingFlags) {
        int totalFields = 2; // General Consent + HIPAA Consent (Financial consent is bonus)
        int completed = 0;

        try {
            if (consentRepository != null && patient.getPatientId() != null) {
                // Check for General Consent (Epic rule: blocks eCheck-in)
                boolean hasGeneralConsent = consentRepository.existsByPatientIdAndConsentTypeAndConsentSigned(
                        patient.getPatientId(), PatientConsent.TYPE_GENERAL, true);
                if (hasGeneralConsent) {
                    completed++;
                } else {
                    missing.add(createMissingField("CONSENTS", "generalConsent", 
                            "CRITICAL", "Required for treatment and eCheck-in",
                            "/profile?focus=consents"));
                    blockingFlags.add("ECHECKIN_BLOCK");
                }

                // Check for HIPAA Consent (Epic rule: blocks eCheck-in and claim generation)
                boolean hasHipaaConsent = consentRepository.existsByPatientIdAndConsentTypeAndConsentSigned(
                        patient.getPatientId(), PatientConsent.TYPE_HIPAA, true);
                if (hasHipaaConsent) {
                    completed++;
                } else {
                    missing.add(createMissingField("CONSENTS", "hipaaConsent", 
                            "CRITICAL", "Required for treatment, billing, and eCheck-in",
                            "/profile?focus=consents"));
                    blockingFlags.add("ECHECKIN_BLOCK");
                    blockingFlags.add("CLAIM_GENERATION_BLOCK");
                }
                
                // Check for Financial/Billing Consent (Epic rule: blocks claim generation)
                boolean hasBillingConsent = consentRepository.existsByPatientIdAndConsentTypeAndConsentSigned(
                        patient.getPatientId(), PatientConsent.TYPE_FINANCIAL, true);
                if (hasBillingConsent) {
                    // Count as complete if present
                    // Note: Not adding to totalFields since it's a bonus field
                } else {
                    // Financial consent is critical for claim generation
                    missing.add(createMissingField("CONSENTS", "financialConsent", 
                            "CRITICAL", "Required for billing and claim generation",
                            "/profile?focus=consents"));
                    blockingFlags.add("CLAIM_GENERATION_BLOCK");
                }
            } else {
                // If repository not available, assume missing
                missing.add(createMissingField("CONSENTS", "generalConsent", 
                        "CRITICAL", "Required for treatment",
                        "/profile?focus=consents"));
                missing.add(createMissingField("CONSENTS", "hipaaConsent", 
                        "CRITICAL", "Required for treatment and billing",
                        "/profile?focus=consents"));
                blockingFlags.add("ECHECKIN_BLOCK");
            }
        } catch (Exception e) {
            log.warn("Error checking consents for completeness: {}", e.getMessage());
            // On error, assume missing
            missing.add(createMissingField("CONSENTS", "generalConsent", 
                    "CRITICAL", "Required for treatment",
                    "/profile?focus=consents"));
            blockingFlags.add("ECHECKIN_BLOCK");
        }

        return Math.round((completed * 100) / totalFields);
    }

    private int computeClinicalSection(Patient patient,
                                      List<RegistrationCompletenessDto.MissingFieldDto> missing) {
        // Clinical Basics (Epic rule: allergies are critical for safety, but section is optional overall)
        int totalFields = 1; // Allergies (critical for clinical safety)
        int completed = 0;
        
        // Allergies - CRITICAL for clinical safety (Epic rule: blocks visit arrival if missing)
        if (patient.getAllergies() != null && !patient.getAllergies().trim().isEmpty()) {
            completed++;
        } else {
            missing.add(createMissingField("CLINICAL_BASICS", "allergies", 
                    "CRITICAL", "Required for clinical safety and visit arrival",
                    "/profile?focus=allergies"));
            // Note: Epic may warn but not block visit arrival - this is a safety recommendation
        }
        
        return Math.round((completed * 100) / totalFields);
    }

    private int calculateWeightedPercent(List<RegistrationCompletenessDto.SectionCompletenessDto> sections) {
        int weightedSum = 0;
        for (RegistrationCompletenessDto.SectionCompletenessDto section : sections) {
            weightedSum += (section.getPercent() * section.getWeight()) / 100;
        }
        return Math.max(0, Math.min(100, weightedSum));
    }

    private RegistrationCompletenessDto.CompletenessStatus determineStatus(
            int overallPercent,
            List<RegistrationCompletenessDto.MissingFieldDto> missingFields,
            Set<String> blockingFlags) {
        
        if (overallPercent == 100 && blockingFlags.isEmpty()) {
            return RegistrationCompletenessDto.CompletenessStatus.COMPLETE;
        }
        
        // Check for critical missing fields or blocking flags
        boolean hasCritical = missingFields.stream()
                .anyMatch(f -> "CRITICAL".equals(f.getSeverity()));
        
        if (hasCritical || !blockingFlags.isEmpty()) {
            return RegistrationCompletenessDto.CompletenessStatus.CRITICAL;
        }
        
        return RegistrationCompletenessDto.CompletenessStatus.INCOMPLETE;
    }

    /**
     * Helper method to create MissingFieldDto with all required fields.
     * Parameters: section, field, severity, message, deepLinkRoute
     * Automatically generates FHIR path based on section and field.
     */
    private RegistrationCompletenessDto.MissingFieldDto createMissingField(
            String section, String field, String severity, 
            String message, String deepLinkRoute) {
        String fhirPath = generateFhirPath(section, field);
        return new RegistrationCompletenessDto.MissingFieldDto(
                section, field, severity, message, deepLinkRoute, fhirPath);
    }

    /**
     * Generate FHIR path for a missing field.
     * Maps internal field names to FHIR R4 resource paths.
     */
    private String generateFhirPath(String section, String field) {
        switch (section) {
            case "DEMOGRAPHICS":
                switch (field) {
                    case "legalName":
                    case "firstName":
                        return "Patient.name[0].given[0]";
                    case "lastName":
                        return "Patient.name[0].family";
                    case "dateOfBirth":
                        return "Patient.birthDate";
                    case "birthSex":
                    case "gender":
                        return "Patient.gender";
                    case "addressLine1":
                        return "Patient.address[0].line[0]";
                    case "city":
                        return "Patient.address[0].city";
                    case "state":
                        return "Patient.address[0].state";
                    case "zip":
                    case "postalCode":
                        return "Patient.address[0].postalCode";
                    default:
                        return "Patient." + field;
                }
            case "CONTACT":
                switch (field) {
                    case "phoneNumber":
                        return "Patient.telecom[system=\"phone\"].value";
                    case "email":
                        return "Patient.telecom[system=\"email\"].value";
                    default:
                        return "Patient.telecom." + field;
                }
            case "EMERGENCY":
                return "Patient.contact[0]." + field;
            case "INSURANCE":
                switch (field) {
                    case "primaryInsurancePayer":
                        return "Coverage.payor[0].display";
                    case "memberId":
                    case "insurancePolicyNumber":
                        return "Coverage.subscriberId";
                    case "subscriberName":
                        return "Coverage.subscriber.display";
                    default:
                        return "Coverage." + field;
                }
            case "CONSENTS":
                switch (field) {
                    case "generalConsent":
                        return "Consent[category=\"General Consent\"].status";
                    case "hipaaConsent":
                        return "Consent[category=\"HIPAA Consent\"].status";
                    case "financialConsent":
                    case "billingConsent":
                        return "Consent[category=\"Billing Consent\"].status";
                    default:
                        return "Consent." + field;
                }
            case "CLINICAL_BASICS":
                switch (field) {
                    case "allergies":
                        return "Patient.allergyIntolerance";
                    default:
                        return "Patient." + field;
                }
            default:
                return "Patient." + field;
        }
    }
}

