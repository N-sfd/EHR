package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.dto.DoctorWithAppointmentsDto;
import com.ehr.staffservice.dto.ProviderValidationDto;

import java.util.List;

public interface DoctorService {
    DoctorDto create(DoctorDto dto);
    DoctorDto update(Long id, DoctorDto dto);
    DoctorDto get(Long id);
    List<DoctorDto> getAll();
    void delete(Long id);

    DoctorWithAppointmentsDto getDoctorWithAppointments(Long doctorId);
    
    ProviderValidationDto validateProvider(Long id);
}

