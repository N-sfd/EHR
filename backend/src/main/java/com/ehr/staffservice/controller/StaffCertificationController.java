package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.StaffCertificationDto;
import com.ehr.staffservice.service.StaffCertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/certifications")
@RequiredArgsConstructor
public class StaffCertificationController {

    private final StaffCertificationService service;

    @PostMapping
    public StaffCertificationDto add(@Valid @RequestBody StaffCertificationDto dto){
        return service.add(dto);
    }

    @GetMapping("/staff/{staffId}")
    public List<StaffCertificationDto> byStaff(@PathVariable UUID staffId){
        return service.getByStaff(staffId);
    }
}
