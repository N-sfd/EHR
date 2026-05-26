package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.PatientDto;
import com.ehr.staffservice.entity.Patient;
import com.ehr.staffservice.exception.DuplicateResourceException;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.PatientMapper;
import com.ehr.staffservice.repository.PatientRepository;
import com.ehr.staffservice.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository repository;
    private final PatientMapper mapper;
    private final EntityManager entityManager;
    
    private final Object patientIdLock = new Object();

    @Override
    @Transactional
    public PatientDto create(PatientDto dto) {
        // Check for duplicate email
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            repository.findByEmail(dto.getEmail())
                    .ifPresent(patient -> {
                        throw new DuplicateResourceException("Patient with email " + dto.getEmail() + " already exists");
                    });
        }

        // Check for duplicate phone number
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty()) {
            repository.findByPhoneNumber(dto.getPhoneNumber())
                    .ifPresent(patient -> {
                        throw new DuplicateResourceException("Patient with phone number " + dto.getPhoneNumber() + " already exists");
                    });
        }

        Patient entity = mapper.toEntity(dto);
        entity.setPatientId(null); // ensure insert
        entity.setPatientCode(generatePatientCode());
        
        if (entity.getStatus() == null || entity.getStatus().isEmpty()) {
            entity.setStatus("ACTIVE");
        }

        Patient saved = repository.save(entity);
        entityManager.flush(); // Ensure data is persisted to database immediately
        return mapper.toDto(saved);
    }

    @Override
    @Transactional
    public PatientDto update(Long id, PatientDto dto) {
        Patient entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));

        // Check for duplicate email (if changed)
        if (dto.getEmail() != null && !dto.getEmail().isEmpty() 
                && !dto.getEmail().equals(entity.getEmail())) {
            repository.findByEmail(dto.getEmail())
                    .ifPresent(patient -> {
                        if (!patient.getPatientId().equals(id)) {
                            throw new DuplicateResourceException("Patient with email " + dto.getEmail() + " already exists");
                        }
                    });
        }

        // Check for duplicate phone number (if changed)
        if (dto.getPhoneNumber() != null && !dto.getPhoneNumber().isEmpty() 
                && !dto.getPhoneNumber().equals(entity.getPhoneNumber())) {
            repository.findByPhoneNumber(dto.getPhoneNumber())
                    .ifPresent(patient -> {
                        if (!patient.getPatientId().equals(id)) {
                            throw new DuplicateResourceException("Patient with phone number " + dto.getPhoneNumber() + " already exists");
                        }
                    });
        }

        // Update ALL fields explicitly - don't skip empty strings, save everything
        // This ensures all data from the form is persisted to the database
        
        if (dto.getFirstName() != null) {
            entity.setFirstName(dto.getFirstName().trim());
        }
        if (dto.getLastName() != null) {
            entity.setLastName(dto.getLastName().trim());
        }
        if (dto.getDateOfBirth() != null) {
            entity.setDateOfBirth(dto.getDateOfBirth());
        }
        
        // Handle both gender and sex fields
        String genderValue = dto.getGender();
        if (genderValue == null || genderValue.isEmpty()) {
            genderValue = dto.getSex();
        }
        if (genderValue != null) {
            entity.setGender(genderValue.trim());
        }
        
        if (dto.getPhoneNumber() != null) {
            entity.setPhoneNumber(dto.getPhoneNumber().trim());
        }
        if (dto.getEmail() != null) {
            entity.setEmail(dto.getEmail().trim());
        }
        
        // Handle address fields - prioritize addressLine1
        // Frontend always sends these fields (even as null), so null means "clear this field"
        // Only update if the field is explicitly provided in DTO
        if (dto.getAddressLine1() != null || dto.getAddress() != null) {
            String addr1 = dto.getAddressLine1() != null ? dto.getAddressLine1().trim() : 
                          (dto.getAddress() != null ? dto.getAddress().trim() : "");
            entity.setAddressLine1(addr1.isEmpty() ? null : addr1);
            // Also set address for backward compatibility
            entity.setAddress(addr1.isEmpty() ? null : addr1);
        }
        // Note: If both are null and not sent, don't update (preserve existing values)
        
        // Update addressLine2 only if explicitly provided
        if (dto.getAddressLine2() != null) {
            String addr2 = dto.getAddressLine2().trim();
            entity.setAddressLine2(addr2.isEmpty() ? null : addr2);
        }
        // Note: If null and not sent, don't update (preserve existing value)
        
        // Update city only if explicitly provided
        if (dto.getCity() != null) {
            String city = dto.getCity().trim();
            entity.setCity(city.isEmpty() ? null : city);
        }
        // Note: If null and not sent, don't update (preserve existing value)
        
        // Update state only if explicitly provided
        if (dto.getState() != null) {
            String state = dto.getState().trim();
            entity.setState(state.isEmpty() ? null : state);
        }
        // Note: If null and not sent, don't update (preserve existing value)
        
        // Update zipCode only if explicitly provided (handle both zipCode and pincode from DTO)
        if (dto.getZipCode() != null) {
            String zip = dto.getZipCode().trim();
            entity.setZipCode(zip.isEmpty() ? null : zip);
        }
        // Note: If null and not sent, don't update (preserve existing value)
        
        // Save photoUrl (profile image) - can be base64 data URL or URL string
        if (dto.getPhotoUrl() != null) {
            String photoUrl = dto.getPhotoUrl().trim();
            entity.setPhotoUrl(photoUrl.isEmpty() ? null : photoUrl);
        }
        
        // Save other optional fields
        if (dto.getCountry() != null) {
            String country = dto.getCountry().trim();
            entity.setCountry(country.isEmpty() ? null : country);
        }
        if (dto.getEmergencyContactName() != null) {
            String ecName = dto.getEmergencyContactName().trim();
            entity.setEmergencyContactName(ecName.isEmpty() ? null : ecName);
        }
        if (dto.getEmergencyContactPhone() != null) {
            String ecPhone = dto.getEmergencyContactPhone().trim();
            entity.setEmergencyContactPhone(ecPhone.isEmpty() ? null : ecPhone);
        }
        if (dto.getBloodGroup() != null) {
            String bg = dto.getBloodGroup().trim();
            entity.setBloodGroup(bg.isEmpty() ? null : bg);
        }
        if (dto.getAllergies() != null) {
            entity.setAllergies(dto.getAllergies().trim());
        }
        if (dto.getMedicalHistory() != null) {
            entity.setMedicalHistory(dto.getMedicalHistory().trim());
        }
        if (dto.getStatus() != null) {
            String status = dto.getStatus().trim();
            entity.setStatus(status.isEmpty() ? null : status);
        }
        if (dto.getInsuranceProvider() != null) {
            String insProvider = dto.getInsuranceProvider().trim();
            entity.setInsuranceProvider(insProvider.isEmpty() ? null : insProvider);
        }
        if (dto.getInsurancePolicyNumber() != null) {
            String insPolicy = dto.getInsurancePolicyNumber().trim();
            entity.setInsurancePolicyNumber(insPolicy.isEmpty() ? null : insPolicy);
        }
        if (dto.getPrimaryDoctorId() != null) {
            entity.setPrimaryDoctorId(dto.getPrimaryDoctorId());
        }
        
        // Don't call mapper.updateEntityFromDto here - we've set everything explicitly
        // The mapper might overwrite our explicit sets with null values
        
        Patient updated = repository.save(entity);
        entityManager.flush(); // Ensure data is persisted to database immediately
        entityManager.refresh(updated); // Refresh to get latest data from DB
        return mapper.toDto(updated);
    }

    @Override
    public PatientDto get(Long id) {
        Patient entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public PatientDto getByPatientCode(String patientCode) {
        Patient entity = repository.findByPatientCode(patientCode)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with code: " + patientCode));
        return mapper.toDto(entity);
    }

    @Override
    public List<PatientDto> getAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PatientDto> searchPatients(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAll();
        }
        
        String searchTerm = query.trim().toLowerCase();
        
        return repository.findAll().stream()
                .filter(patient -> {
                    // Search by name (first name + last name)
                    String fullName = ((patient.getFirstName() != null ? patient.getFirstName() : "") + " " +
                                      (patient.getLastName() != null ? patient.getLastName() : "")).trim().toLowerCase();
                    if (fullName.contains(searchTerm)) {
                        return true;
                    }
                    
                    // Search by patient code (MRN)
                    if (patient.getPatientCode() != null && 
                        patient.getPatientCode().toLowerCase().contains(searchTerm)) {
                        return true;
                    }
                    
                    // Search by phone number
                    if (patient.getPhoneNumber() != null && 
                        patient.getPhoneNumber().toLowerCase().contains(searchTerm)) {
                        return true;
                    }
                    
                    // Search by email
                    if (patient.getEmail() != null && 
                        patient.getEmail().toLowerCase().contains(searchTerm)) {
                        return true;
                    }
                    
                    // Search by date of birth (format: YYYY-MM-DD)
                    if (patient.getDateOfBirth() != null) {
                        String dob = patient.getDateOfBirth().toString();
                        if (dob.contains(searchTerm)) {
                            return true;
                        }
                    }
                    
                    return false;
                })
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Patient not found with id: " + id);
        }
        repository.deleteById(id);
    }

    private String generatePatientCode() {
        synchronized (patientIdLock) {
            Optional<String> maxCode = repository.findAll().stream()
                    .map(Patient::getPatientCode)
                    .filter(code -> code != null && code.startsWith("P-"))
                    .max(String::compareTo);
            
            long nextNum = 1;
            if (maxCode.isPresent() && maxCode.get() != null) {
                try {
                    String code = maxCode.get();
                    String numPart = code.substring(2); // Remove "P-" prefix
                    nextNum = Long.parseLong(numPart) + 1;
                } catch (Exception e) {
                    // If parsing fails, use count as fallback
                    nextNum = repository.count() + 1;
                }
            }
            
            String code = String.format("P-%04d", nextNum);
            // Verify uniqueness
            int attempts = 0;
            while (repository.findByPatientCode(code).isPresent() && attempts < 10) {
                nextNum++;
                code = String.format("P-%04d", nextNum);
                attempts++;
            }
            return code;
        }
    }
}

