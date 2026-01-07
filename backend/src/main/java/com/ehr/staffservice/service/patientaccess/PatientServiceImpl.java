package com.ehr.staffservice.service.patientaccess;

import com.ehr.staffservice.dto.patientaccess.PatientDto;
import com.ehr.staffservice.entity.patientaccess.Patient;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.patientaccess.PatientMapper;
import com.ehr.staffservice.repository.patientaccess.PatientAccessPatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("patientAccessPatientServiceImpl")
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {
    private final PatientAccessPatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PatientDto> searchPatients(String query) {
        List<Patient> patients = patientRepository.searchByQuery(query);
        return patients.stream()
                .map(patientMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDto getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        return patientMapper.toDto(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientDto getPatientByMrn(String mrn) {
        Patient patient = patientRepository.findByMrn(mrn)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with MRN: " + mrn));
        return patientMapper.toDto(patient);
    }

    @Override
    @Transactional
    public PatientDto createPatient(PatientDto dto) {
        Patient patient = patientMapper.toEntity(dto);
        Patient saved = patientRepository.save(patient);
        return patientMapper.toDto(saved);
    }

    @Override
    @Transactional
    public PatientDto updatePatient(Long id, PatientDto dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id: " + id));
        
        patient.setFirstName(dto.getFirstName());
        patient.setLastName(dto.getLastName());
        patient.setDateOfBirth(dto.getDateOfBirth());
        patient.setSex(dto.getSex());
        patient.setPhone(dto.getPhone());
        patient.setEmail(dto.getEmail());
        patient.setAddressLine1(dto.getAddressLine1());
        patient.setAddressLine2(dto.getAddressLine2());
        patient.setCity(dto.getCity());
        patient.setState(dto.getState());
        patient.setZipCode(dto.getZipCode());
        patient.setCountry(dto.getCountry());
        patient.setAlerts(dto.getAlerts());
        
        Patient saved = patientRepository.save(patient);
        return patientMapper.toDto(saved);
    }
}

