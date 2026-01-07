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

        mapper.updateEntityFromDto(dto, entity);
        Patient updated = repository.save(entity);
        entityManager.flush(); // Ensure data is persisted to database immediately
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

