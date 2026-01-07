package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.service.AppointmentClient;
import com.ehr.staffservice.dto.StaffDto;
import com.ehr.staffservice.dto.StaffWithAppointmentsDto;
import com.ehr.staffservice.entity.Staff;
import com.ehr.staffservice.entity.Doctor;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.StaffMapper;
import com.ehr.staffservice.repository.StaffRepository;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class StaffServiceImpl implements StaffService {

    private final StaffRepository repo;
    private final DoctorRepository doctorRepo;
    private final StaffMapper mapper;
    private final AppointmentClient appointmentClient;
    
    private final Object staffIdLock = new Object();
    private final Object doctorIdLock = new Object();
    
    private String generateStaffId() {
        synchronized (staffIdLock) {
            // Use MAX code instead of COUNT for better concurrency handling
            Optional<String> maxCode = repo.findMaxStaffCode();
            long nextNum = 1;
            if (maxCode.isPresent() && maxCode.get() != null) {
                try {
                    String code = maxCode.get();
                    String numPart = code.substring(2); // Remove "S-" prefix
                    nextNum = Long.parseLong(numPart) + 1;
                } catch (Exception e) {
                    // If parsing fails, use count as fallback
                    nextNum = repo.count() + 1;
                }
            }
            String code = String.format("S-%03d", nextNum);
            // Verify uniqueness (handle race conditions)
            int attempts = 0;
            while (repo.existsByStaffCode(code) && attempts < 10) {
                nextNum++;
                code = String.format("S-%03d", nextNum);
                attempts++;
            }
            return code;
        }
    }

    private String generateDoctorId() {
        synchronized (doctorIdLock) {
            // Use MAX code instead of COUNT for better concurrency handling
            Optional<String> maxCode = doctorRepo.findMaxDoctorCode();
            long nextNum = 1;
            if (maxCode.isPresent() && maxCode.get() != null) {
                try {
                    String code = maxCode.get();
                    String numPart = code.substring(2); // Remove "D-" prefix
                    nextNum = Long.parseLong(numPart) + 1;
                } catch (Exception e) {
                    // If parsing fails, use count as fallback
                    nextNum = doctorRepo.count() + 1;
                }
            }
            String code = String.format("D-%03d", nextNum);
            // Verify uniqueness (handle race conditions)
            int attempts = 0;
            while (doctorRepo.existsByDoctorCode(code) && attempts < 10) {
                nextNum++;
                code = String.format("D-%03d", nextNum);
                attempts++;
            }
            return code;
        }
    }

    @Override
    @Transactional
    public StaffDto create(StaffDto dto) {
        Staff entity = mapper.toEntity(dto);
        entity.setStaffId(null); // ensure insert
        
        // Generate staff code with retry on duplicate
        String staffCode = generateStaffId();
        entity.setStaffCode(staffCode);
        
        Staff saved = null;
        int staffRetries = 0;
        while (saved == null && staffRetries < 5) {
            try {
                saved = repo.save(entity);
            } catch (DataIntegrityViolationException e) {
                if (e.getMessage() != null && e.getMessage().contains("staff_code")) {
                    staffRetries++;
                    staffCode = generateStaffId();
                    entity.setStaffCode(staffCode);
                } else {
                    throw e;
                }
            }
        }
        if (saved == null) {
            throw new RuntimeException("Failed to generate unique staff code after retries");
        }
        
        // If this is a doctor, create doctor record and generate doctor code with retry
        if (dto.getIsDoctor() != null && dto.getIsDoctor()) {
            Doctor createdDoctor = new Doctor();
            createdDoctor.setStaff(saved);
            String doctorCode = generateDoctorId();
            createdDoctor.setDoctorCode(doctorCode);
            
            boolean doctorSaved = false;
            int doctorRetries = 0;
            while (!doctorSaved && doctorRetries < 5) {
                try {
                    createdDoctor = doctorRepo.save(createdDoctor);
                    doctorSaved = true;
                } catch (DataIntegrityViolationException e) {
                    String errorMsg = e.getMessage();
                    if (e.getCause() != null && e.getCause().getMessage() != null) {
                        errorMsg = e.getCause().getMessage();
                    }
                    if (errorMsg != null && (errorMsg.contains("doctor_code") || 
                        errorMsg.contains("duplicate key") || 
                        errorMsg.contains("unique constraint"))) {
                        doctorRetries++;
                        if (doctorRetries >= 5) {
                            throw new RuntimeException("Failed to generate unique doctor code after retries: " + errorMsg);
                        }
                        doctorCode = generateDoctorId();
                        createdDoctor = new Doctor();
                        createdDoctor.setStaff(saved);
                        createdDoctor.setDoctorCode(doctorCode);
                    } else {
                        throw e;
                    }
                }
            }
        }
        
        StaffDto result = mapper.toDto(saved);
        result.setIsDoctor(saved.getDoctor() != null);
        result.setDoctorCode(saved.getDoctor() != null ? saved.getDoctor().getDoctorCode() : null);
        return result;
    }

    @Override
    @Transactional
    public StaffDto update(Long id, StaffDto dto) {
        Staff existing = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        mapper.updateEntityFromDto(dto, existing);
        Staff saved = repo.save(existing);
        return mapper.toDto(saved);
    }

    @Override
    public StaffDto get(Long id) {
        Staff st = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        StaffDto dto = mapper.toDto(st);
        dto.setIsDoctor(st.getDoctor() != null);
        dto.setDoctorCode(st.getDoctor() != null ? st.getDoctor().getDoctorCode() : null);
        return dto;
    }

    @Override
    public List<StaffDto> getAll() {
        return repo.findAll().stream().map(staff -> {
            StaffDto dto = mapper.toDto(staff);
            dto.setIsDoctor(staff.getDoctor() != null);
            dto.setDoctorCode(staff.getDoctor() != null ? staff.getDoctor().getDoctorCode() : null);
            return dto;
        }).toList();
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Staff staff = repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));
        
        // If this staff is a doctor, prevent deletion through staff endpoint
        // (should use doctor endpoint instead)
        if (staff.getDoctor() != null) {
            throw new IllegalStateException("Cannot delete staff that is a doctor. Use doctor deletion endpoint instead.");
        }
        
        repo.deleteById(id);
    }

   @Override
    public StaffWithAppointmentsDto getStaffWithAppointments(Long staffId) {
        var staff = repo.findById(staffId)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found"));

        var staffDto = mapper.toDto(staff);
        var appointments = appointmentClient.getAppointmentsForDoctor(staffId);

        StaffWithAppointmentsDto result = new StaffWithAppointmentsDto();
        result.setStaff(staffDto);
        result.setAppointments(appointments);
        return result;
    }
}