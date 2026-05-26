package com.ehr.staffservice.service.patientaccess;

import com.ehr.staffservice.dto.patientaccess.PatientDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Patient Access Service
 * Uses canonical Patient entity (patients table)
 * Maps to patientaccess.PatientDto for API compatibility
 */
@Service("patientAccessPatientServiceImpl")
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientRepository patientRepository; // Use canonical repository

    @Override
    @Transactional(readOnly = true)
    public List<PatientDto> searchPatients(String query) {
        // Search in canonical patients table by name, patientCode, email, phone
        List<Patient> patients = patientRepository.findAll().stream()
                .filter(p -> matchesQuery(p, query))
                .collect(Collectors.toList());
        return patients.stream()
                .map(this::toPatientAccessDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return toPatientAccessDto(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDto getPatientByMrn(String mrn) {
        // Map MRN to patientCode (treat as same concept)
        Patient patient = patientRepository.findByPatientCode(mrn)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with MRN: " + mrn));
        return toPatientAccessDto(patient);
    }

    @Override
    @Transactional
    public PatientDto createPatient(PatientDto dto) {
        Patient patient = new Patient();
        updatePatientFromDto(patient, dto);
        // Use MRN as patientCode
        patient.setPatientCode(dto.getMrn());
        Patient saved = patientRepository.save(patient);
        return toPatientAccessDto(saved);
    }

    @Override
    @Transactional
    public PatientDto updatePatient(Long id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        updatePatientFromDto(patient, dto);
        Patient saved = patientRepository.save(patient);
        return toPatientAccessDto(saved);
    }

    /**
     * Map canonical Patient entity to patientaccess.PatientDto
     */
    private PatientDto toPatientAccessDto(Patient patient) {
        PatientDto dto = new PatientDto();
        dto.setId(patient.getPatientId());
        dto.setMrn(patient.getPatientCode()); // Map patientCode to MRN
        dto.setFirstName(patient.getFirstName());
        dto.setLastName(patient.getLastName());
        dto.setDateOfBirth(patient.getDateOfBirth());
        dto.setSex(patient.getGender());
        dto.setPhone(patient.getPhoneNumber());
        dto.setEmail(patient.getEmail());
        dto.setAddressLine1(patient.getAddressLine1());
        dto.setAddressLine2(patient.getAddressLine2());
        dto.setCity(patient.getCity());
        dto.setState(patient.getState());
        dto.setZipCode(patient.getZipCode());
        dto.setCountry(patient.getCountry());
        // Alerts not in canonical Patient - set empty list
        dto.setAlerts(new java.util.ArrayList<>());
        return dto;
    }

    /**
     * Update Patient entity from patientaccess.PatientDto
     */
    private void updatePatientFromDto(Patient patient, PatientDto dto) {
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setGender(dto.getSex());
        patient.setPhoneNumber(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddressLine1(dto.getAddressLine1());
        patient.setAddressLine2(dto.getAddressLine2());
        patient.setCity(dto.getCity());
        patient.setState(dto.getState());
        patient.setZipCode(dto.getZipCode());
        patient.setCountry(dto.getCountry());
    }

    /**
     * Check if patient matches search query
     */
    private boolean matchesQuery(Patient patient, String query) {
        if (query == null || query.trim().isEmpty()) {
            return true;
        }
        String lowerQuery = query.toLowerCase();
        return (patient.getFirstName() != null && patient.getFirstName().toLowerCase().contains(lowerQuery)) ||
               (patient.getLastName() != null && patient.getLastName().toLowerCase().contains(lowerQuery)) ||
               (patient.getPatientCode() != null && patient.getPatientCode().toLowerCase().contains(lowerQuery)) ||
               (patient.getEmail() != null && patient.getEmail().toLowerCase().contains(lowerQuery)) ||
               (patient.getPhoneNumber() != null && patient.getPhoneNumber().contains(query));
    }
}

