package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.PatientProfileDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientAddress;
import com.ehr.staffservice.repository.PatientAddressRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Service to compute patient registration completeness.
 * Used by both Admin and MyChart to show registration status.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RegistrationCompletenessService {

    private final PatientAddressRepository addressRepository;

    /**
     * Compute registration completeness for a patient.
     * Returns percentComplete (0-100) and list of missing fields with severity.
     * 
     * This matches the frontend registration completeness logic:
     * - Demographics: legalName, dateOfBirth, birthSex, phone, address1, city, state, zip (8 fields)
     * - Coverage: primaryInsurancePayer, memberId (2 fields)
     * - Total: 10 required fields (consent is handled separately in frontend)
     * - Calculation: (completedFields / totalFields) * 100
     */
    @Transactional(readOnly = true)
    public PatientProfileDto.RegistrationStatusDto computeRegistrationStatus(Patient patient) {
        List<PatientProfileDto.MissingFieldDto> missingFields = new ArrayList<>();
        
        // Get primary address if available, otherwise check patient table address fields
        List<PatientAddress> addresses = addressRepository.findByPatientIdAndIsPrimary(patient.getPatientId(), true);
        PatientAddress primaryAddress = addresses.isEmpty() ? null : addresses.get(0);
        
        // Check DEMOGRAPHICS group (matches frontend logic)
        // 1. Legal Name (First + Last)
        if (patient.getFirstName() == null || patient.getFirstName().trim().isEmpty() ||
            patient.getLastName() == null || patient.getLastName().trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "legalName", "Legal Name (First & Last)", "CRITICAL"));
        }
        
        // 2. Date of Birth
        if (patient.getDateOfBirth() == null) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "dateOfBirth", "Date of Birth", "CRITICAL"));
        }
        
        // 3. Birth Sex (gender field)
        if (patient.getGender() == null || patient.getGender().trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "birthSex", "Birth Sex", "CRITICAL"));
        }
        
        // 4. Phone Number
        if (patient.getPhoneNumber() == null || patient.getPhoneNumber().trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "phone", "Phone Number", "CRITICAL"));
        }
        
        // 5-8. Address fields (check primaryAddress first, then fallback to patient table)
        String addressLine1 = null;
        String city = null;
        String state = null;
        String zipCode = null;
        
        if (primaryAddress != null) {
            addressLine1 = primaryAddress.getAddressLine1();
            city = primaryAddress.getCity();
            state = primaryAddress.getStateProvince();
            zipCode = primaryAddress.getPostalCode();
        } else {
            // Fallback to patient table address fields
            addressLine1 = patient.getAddressLine1();
            city = patient.getCity();
            state = patient.getState();
            zipCode = patient.getZipCode();
        }
        
        if (addressLine1 == null || addressLine1.trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "address1", "Address Line 1", "CRITICAL"));
        }
        if (city == null || city.trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "city", "City", "CRITICAL"));
        }
        if (state == null || state.trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "state", "State", "CRITICAL"));
        }
        if (zipCode == null || zipCode.trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "zip", "ZIP Code", "CRITICAL"));
        }
        
        // Check email (WARNING level, not counted in completeness)
        if (patient.getEmail() == null || patient.getEmail().trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "DEMOGRAPHICS", "email", "Email Address", "WARNING"));
        }
        
        // Check COVERAGE group
        if (patient.getInsuranceProvider() == null || patient.getInsuranceProvider().trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "COVERAGE", "primaryInsurancePayer", "Primary Insurance Payer", "WARNING"));
        }
        if (patient.getInsurancePolicyNumber() == null || patient.getInsurancePolicyNumber().trim().isEmpty()) {
            missingFields.add(new PatientProfileDto.MissingFieldDto(
                    "COVERAGE", "memberId", "Insurance Member ID", "WARNING"));
        }
        
        // Calculate percent complete (matches frontend calculation)
        // Total required fields: 8 demographics (CRITICAL) + 2 coverage (WARNING) = 10 fields
        // Only count CRITICAL and WARNING fields in completeness calculation
        int totalRequiredFields = 10; // 8 demographics + 2 coverage
        long missingRequiredFields = missingFields.stream()
                .filter(f -> "CRITICAL".equals(f.getSeverity()) || "WARNING".equals(f.getSeverity()))
                .count();
        
        int completedFields = totalRequiredFields - (int)missingRequiredFields;
        int percentComplete = totalRequiredFields > 0 
                ? Math.round((completedFields * 100) / totalRequiredFields)
                : 100;
        
        // Ensure percentComplete is between 0 and 100
        percentComplete = Math.max(0, Math.min(100, percentComplete));
        
        return new PatientProfileDto.RegistrationStatusDto(percentComplete, missingFields);
    }
}

