package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.DoctorDto;
import com.ehr.staffservice.dto.DoctorWithAppointmentsDto;
import com.ehr.staffservice.dto.ProviderValidationDto;
import com.ehr.staffservice.service.DoctorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService service;

    @PostMapping
    public DoctorDto create(@Valid @RequestBody DoctorDto dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<DoctorDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DoctorDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public DoctorDto update(@PathVariable Long id,
                           @Valid @RequestBody DoctorDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }

    @GetMapping("/{id}/appointments")
    public DoctorWithAppointmentsDto getDoctorWithAppointments(@PathVariable Long id) {
        return service.getDoctorWithAppointments(id);
    }

    @GetMapping("/{id}/validate")
    public ProviderValidationDto validateProvider(@PathVariable Long id) {
        return service.validateProvider(id);
    }
}

