package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.StaffDto;
import com.ehr.staffservice.dto.StaffWithAppointmentsDto;
import com.ehr.staffservice.service.PatientClient;
import com.ehr.staffservice.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService service;
    private final PatientClient patientClient;

    @PostMapping
    public StaffDto create(@Valid @RequestBody StaffDto dto){
        return service.create(dto);
    }

    @GetMapping("/{id}")
    public StaffDto get(@PathVariable Long id){
        return service.get(id);
    }

    @GetMapping
    public List<StaffDto> all(){
        return service.getAll();
    }

    @PutMapping("/{id}")
    public StaffDto update(@PathVariable Long id, @Valid @RequestBody StaffDto dto){
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){
        service.delete(id);
    }

    // ✅ NEW endpoint: staff + appointments
    @GetMapping("/{id}/appointments")
    public StaffWithAppointmentsDto getStaffWithAppointments(@PathVariable Long id) {
        return service.getStaffWithAppointments(id);
    }

    /**
     * Fetch patient details from Patient API
     * This endpoint acts as a proxy to the Patient microservice
     * @param id Patient ID
     * @return Patient data from Patient API
     */
    @GetMapping("/patient-details/{id}")
    public ResponseEntity<?> getPatient(@PathVariable Long id) {
        Object patient = patientClient.getPatient(id);
        return ResponseEntity.ok(patient);
    }
}
