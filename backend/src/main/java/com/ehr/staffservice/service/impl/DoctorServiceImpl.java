package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.dto.DoctorWithAppointmentsDto;
import com.ehr.staffservice.dto.ProviderValidationDto;
import com.ehr.staffservice.entity.Doctor;
import com.ehr.staffservice.entity.DoctorAvailability;
import com.ehr.staffservice.entity.DoctorCertification;
import com.ehr.staffservice.entity.DoctorEducation;
import com.ehr.staffservice.entity.DoctorLicense;
import com.ehr.staffservice.entity.Staff;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.DoctorAvailabilityMapper;
import com.ehr.staffservice.mapper.DoctorCertificationMapper;
import com.ehr.staffservice.mapper.DoctorEducationMapper;
import com.ehr.staffservice.mapper.DoctorLicenseMapper;
import com.ehr.staffservice.mapper.DoctorMapper;
import com.ehr.staffservice.mapper.StaffMapper;
import com.ehr.staffservice.repository.DoctorRepository;
import com.ehr.staffservice.repository.StaffRepository;
import com.ehr.staffservice.service.AppointmentClient;
import com.ehr.staffservice.service.DoctorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final StaffRepository staffRepository;
    private final DoctorMapper doctorMapper;
    private final StaffMapper staffMapper;
    private final DoctorEducationMapper educationMapper;
    private final DoctorCertificationMapper certificationMapper;
    private final DoctorLicenseMapper licenseMapper;
    private final DoctorAvailabilityMapper availabilityMapper;
    private final AppointmentClient appointmentClient;

    @Override
    @Transactional
    public DoctorDto create(DoctorDto dto) {

        // 1️⃣ First create Staff from DoctorDto
        Staff staff = staffMapper.toEntityFromDoctorDto(dto);
        staff.setStaffId(null); // ensure insert
        staff.setStatus("ACTIVE");

        staff = staffRepository.save(staff);

        // 2️⃣ Create Doctor mapped to this staff record
        Doctor doctor = new Doctor();
        doctor.setStaff(staff);
        doctor.setStaffId(staff.getStaffId());
        doctor.setDoctorCode(generateDoctorCode());
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setAbout(dto.getAbout());
        doctor.setConsultationType(dto.getConsultationType());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());

        // 3️⃣ Map child lists: education, certifications, licenses, availability
        linkChildEntities(doctor, dto);

        doctor = doctorRepository.save(doctor);

        return doctorMapper.toDto(doctor);
    }

    @Override
    public DoctorDto get(Long id) {
        Doctor doctor = doctorRepository.findByStaffStaffId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
        return doctorMapper.toDto(doctor);
    }

    @Override
    public List<DoctorDto> getAll() {
        return doctorRepository.findAll()
                .stream()
                .map(doctorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DoctorDto update(Long id, DoctorDto dto) {
        Doctor doctor = doctorRepository.findByStaffStaffId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        // Update staff fields
        Staff staff = doctor.getStaff();
        if (staff == null) {
            throw new IllegalStateException("Doctor must have associated staff");
        }
        staffMapper.updateEntityFromDoctorDto(dto, staff);
        staff = staffRepository.save(staff);

        // Update doctor-specific fields
        doctor.setSpecialization(dto.getSpecialization());
        doctor.setConsultationFee(dto.getConsultationFee());
        doctor.setConsultationType(dto.getConsultationType());
        doctor.setAbout(dto.getAbout());
        doctor.setYearsOfExperience(dto.getYearsOfExperience());
        doctor.setStaff(staff);

        // Update child entities
        linkChildEntities(doctor, dto);

        return doctorMapper.toDto(doctorRepository.save(doctor));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Doctor doctor = doctorRepository.findByStaffStaffId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        doctorRepository.delete(doctor);
        staffRepository.deleteById(id);
    }

    @Override
    public DoctorWithAppointmentsDto getDoctorWithAppointments(Long id) {
        Doctor doctor = doctorRepository.findByStaffStaffId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        var appointments = appointmentClient.getAppointmentsForDoctor(id);

        DoctorWithAppointmentsDto dto = new DoctorWithAppointmentsDto();
        dto.setDoctor(doctorMapper.toDto(doctor));
        dto.setAppointments(appointments);
        return dto;
    }

    @Override
    public ProviderValidationDto validateProvider(Long id) {
        Doctor doctor = doctorRepository.findByStaffStaffId(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        ProviderValidationDto dto = new ProviderValidationDto();
        dto.setProviderId(id);
        dto.setRole(doctor.getStaff().getRoleId());
        dto.setActive("ACTIVE".equals(doctor.getStaff().getStatus()));
        dto.setValidLicense(doctor.getLicenses() != null && !doctor.getLicenses().isEmpty());

        return dto;
    }

    private void linkChildEntities(Doctor doctor, DoctorDto dto) {
        // Link educations
        if (dto.getEducations() != null) {
            List<DoctorEducation> educations = dto.getEducations().stream()
                    .map(educationMapper::toEntity)
                    .collect(Collectors.toList());
            educations.forEach(e -> {
                e.setDoctorId(doctor.getStaffId());
                e.setDoctor(doctor);
            });
            doctor.setEducations(educations);
        }

        // Link certifications
        if (dto.getCertifications() != null) {
            List<DoctorCertification> certifications = dto.getCertifications().stream()
                    .map(certificationMapper::toEntity)
                    .collect(Collectors.toList());
            certifications.forEach(c -> {
                c.setDoctorId(doctor.getStaffId());
                c.setDoctor(doctor);
            });
            doctor.setCertifications(certifications);
        }

        // Link licenses
        if (dto.getLicenses() != null) {
            List<DoctorLicense> licenses = dto.getLicenses().stream()
                    .map(licenseMapper::toEntity)
                    .collect(Collectors.toList());
            licenses.forEach(l -> {
                l.setDoctorId(doctor.getStaffId());
                l.setDoctor(doctor);
            });
            doctor.setLicenses(licenses);
        }

        // Link availabilities
        if (dto.getAvailabilities() != null) {
            List<DoctorAvailability> availabilities = dto.getAvailabilities().stream()
                    .map(availabilityMapper::toEntity)
                    .collect(Collectors.toList());
            availabilities.forEach(a -> {
                a.setDoctorId(doctor.getStaffId());
                a.setDoctor(doctor);
            });
            doctor.setAvailabilities(availabilities);
        }
    }

    private String generateDoctorCode() {
        Optional<String> maxCode = doctorRepository.findMaxDoctorCode();
        long nextNum = 1;

        if (maxCode.isPresent()) {
            try {
                String num = maxCode.get().substring(2);
                nextNum = Long.parseLong(num) + 1;
            } catch (Exception ignored) {}
        }

        return String.format("D-%03d", nextNum);
    }
}