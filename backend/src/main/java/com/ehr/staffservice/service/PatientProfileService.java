package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.PatientProfileDto;
import com.ehr.staffservice.entity.Doctor;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.entity.PatientAddress;
import com.ehr.staffservice.entity.Staff;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.repository.PatientAddressRepository;
import com.ehr.staffservice.repository.PatientRepository;
import com.ehr.staffservice.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

/**
 * Service to build patient profile for MyChart.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PatientProfileService {

    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;
    private final PatientAddressRepository addressRepository;
    private final RegistrationCompletenessService registrationCompletenessService;

    /**
     * Get patient profile for MyChart.
     */
    @Transactional(readOnly = true)
    public PatientProfileDto getPatientProfile(Long patientId) {
        if (patientId == null) {
            throw new IllegalArgumentException("Patient ID cannot be null");
        }
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with ID: " + patientId));

        // Build patient info
        PatientProfileDto.PatientInfoDto patientInfo = buildPatientInfo(patient);
        
        // Build PCP info
        PatientProfileDto.PcpInfoDto pcp = buildPcpInfo(patient);
        
        // Build coverage summary
        PatientProfileDto.CoverageSummaryDto coverage = buildCoverageSummary(patient);
        
        // Build registration status
        PatientProfileDto.RegistrationStatusDto registrationStatus = 
                registrationCompletenessService.computeRegistrationStatus(patient);

        return new PatientProfileDto(patientInfo, pcp, coverage, registrationStatus);
    }

    private PatientProfileDto.PatientInfoDto buildPatientInfo(Patient patient) {
        String firstName = patient.getFirstName() != null ? patient.getFirstName() : "";
        String lastName = patient.getLastName() != null ? patient.getLastName() : "";
        String displayName = (firstName + " " + lastName).trim();
        
        // Build address
        PatientProfileDto.AddressDto address = null;
        List<PatientAddress> addresses = addressRepository.findByPatientIdAndIsPrimary(patient.getPatientId(), true);
        if (!addresses.isEmpty()) {
            PatientAddress primaryAddress = addresses.get(0);
            address = new PatientProfileDto.AddressDto(
                    primaryAddress.getAddressLine1(),
                    primaryAddress.getAddressLine2(),
                    primaryAddress.getCity(),
                    primaryAddress.getStateProvince(),
                    primaryAddress.getPostalCode()
            );
        } else if (patient.getAddressLine1() != null) {
            // Fallback to patient table address fields
            address = new PatientProfileDto.AddressDto(
                    patient.getAddressLine1(),
                    patient.getAddressLine2(),
                    patient.getCity(),
                    patient.getState(),
                    patient.getZipCode()
            );
        }

        // Map gender to sex
        String sex = null;
        if (patient.getGender() != null) {
            String genderUpper = patient.getGender().toUpperCase();
            if (genderUpper.contains("MALE") && !genderUpper.contains("FEMALE")) {
                sex = "MALE";
            } else if (genderUpper.contains("FEMALE")) {
                sex = "FEMALE";
            } else {
                sex = "OTHER";
            }
        }

        return new PatientProfileDto.PatientInfoDto(
                patient.getPatientId(),
                patient.getPatientCode(),
                firstName,
                lastName,
                displayName.isEmpty() ? "Patient" : displayName,
                patient.getDateOfBirth() != null ? patient.getDateOfBirth().format(DateTimeFormatter.ISO_DATE) : null,
                sex,
                patient.getPhoneNumber(),
                patient.getEmail(),
                address,
                null // preferredLanguage - would come from demographics if needed
        );
    }

    private PatientProfileDto.PcpInfoDto buildPcpInfo(Patient patient) {
        Long providerId = patient.getPrimaryDoctorId();
        if (providerId == null) {
            return null;
        }

        try {
            // Try to get as Doctor first
            Optional<Doctor> doctorOpt = doctorRepository.findById(providerId);
            if (doctorOpt.isPresent()) {
                Doctor doctor = doctorOpt.get();
                Staff staff = doctor.getStaff();
                if (staff != null) {
                    String name = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " +
                                  (staff.getLastName() != null ? staff.getLastName() : "");
                    return new PatientProfileDto.PcpInfoDto(
                            staff.getStaffId(),
                            name.trim(),
                            doctor.getSpecialization() != null ? doctor.getSpecialization() : "Family Medicine",
                            "/api/doctors/" + staff.getStaffId() + "/image",
                            "/messages/new?to=" + staff.getStaffId()
                    );
                }
            } else {
                // Try as Staff directly
                Optional<Staff> staffOpt = staffRepository.findById(providerId);
                if (staffOpt.isPresent()) {
                    Staff staff = staffOpt.get();
                    String name = (staff.getFirstName() != null ? staff.getFirstName() : "") + " " +
                                  (staff.getLastName() != null ? staff.getLastName() : "");
                    return new PatientProfileDto.PcpInfoDto(
                            staff.getStaffId(),
                            name.trim(),
                            "Primary Care Provider",
                            "/api/doctors/" + staff.getStaffId() + "/image",
                            "/messages/new?to=" + staff.getStaffId()
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Error loading PCP for patient {}: {}", patient.getPatientId(), e.getMessage());
        }

        return null;
    }

    private PatientProfileDto.CoverageSummaryDto buildCoverageSummary(Patient patient) {
        boolean hasActiveCoverage = patient.getInsuranceProvider() != null && 
                                   !patient.getInsuranceProvider().trim().isEmpty();
        
        String memberIdMasked = null;
        if (patient.getInsurancePolicyNumber() != null && !patient.getInsurancePolicyNumber().trim().isEmpty()) {
            String policyNumber = patient.getInsurancePolicyNumber().trim();
            if (policyNumber.length() > 4) {
                memberIdMasked = "****" + policyNumber.substring(policyNumber.length() - 4);
            } else {
                memberIdMasked = "****" + policyNumber;
            }
        }

        return new PatientProfileDto.CoverageSummaryDto(
                hasActiveCoverage,
                patient.getInsuranceProvider(),
                memberIdMasked,
                null, // planType - not stored in patient table
                null, // effectiveFrom - not stored
                null  // effectiveTo - not stored
        );
    }
}

