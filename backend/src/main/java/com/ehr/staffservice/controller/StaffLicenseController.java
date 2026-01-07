package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.StaffLicenseDto;
import com.ehr.staffservice.service.StaffLicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/licenses")
@RequiredArgsConstructor
public class StaffLicenseController {

    private final StaffLicenseService service;

    @PostMapping
    public StaffLicenseDto add(@Valid @RequestBody StaffLicenseDto dto){
        return service.add(dto);
    }

    @GetMapping("/staff/{staffId}")
    public List<StaffLicenseDto> byStaff(@PathVariable UUID staffId){
        return service.getByStaff(staffId);
    }
}
