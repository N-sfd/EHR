package com.ehr.staffservice.controller.patientaccess;

import com.ehr.staffservice.dto.patientaccess.PatientDto;
import com.ehr.staffservice.dto.patientaccess.CoverageDto;
import com.ehr.staffservice.response.ApiResponse;
import com.ehr.staffservice.service.patientaccess.PatientService;
import com.ehr.staffservice.service.patientaccess.CoverageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patient-access/patients")
@RequiredArgsConstructor
public class PatientAccessController {
    private final PatientService patientService;
    private final CoverageService coverageService;

    @GetMapping
    public ResponseEntity<ApiResponse> searchPatients(
            @RequestParam(required = false) String query) {
        List<PatientDto> patients;
        if (query != null && !query.trim().isEmpty()) {
            patients = patientService.searchPatients(query);
        } else {
            patients = List.of(); // Return empty list if no query
        }
        return ResponseEntity.ok(ApiResponse.ok(patients, "Patients retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getPatientById(@PathVariable Long id) {
        PatientDto patient = patientService.getPatientById(id);
        return ResponseEntity.ok(ApiResponse.ok(patient, "Patient retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createPatient(@Valid @RequestBody PatientDto dto) {
        PatientDto created = patientService.createPatient(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Patient created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updatePatient(
            @PathVariable Long id,
            @Valid @RequestBody PatientDto dto) {
        PatientDto updated = patientService.updatePatient(id, dto);
        return ResponseEntity.ok(ApiResponse.ok(updated, "Patient updated successfully"));
    }

    @GetMapping("/{id}/coverage")
    public ResponseEntity<ApiResponse> getCoverages(@PathVariable Long id) {
        List<CoverageDto> coverages = coverageService.getCoveragesByPatientId(id);
        return ResponseEntity.ok(ApiResponse.ok(coverages, "Coverages retrieved successfully"));
    }

    @GetMapping("/{id}/coverage/primary")
    public ResponseEntity<ApiResponse> getPrimaryCoverage(@PathVariable Long id) {
        CoverageDto coverage = coverageService.getPrimaryCoverage(id);
        return ResponseEntity.ok(ApiResponse.ok(coverage, "Primary coverage retrieved successfully"));
    }

    @PostMapping("/{id}/coverage")
    public ResponseEntity<ApiResponse> createCoverage(
            @PathVariable Long id,
            @Valid @RequestBody CoverageDto dto) {
        dto.setPatientId(id);
        CoverageDto created = coverageService.createCoverage(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Coverage created successfully"));
    }
}

