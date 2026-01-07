package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.StaffEducationDto;
import com.ehr.staffservice.service.StaffEducationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/education")
@RequiredArgsConstructor
public class StaffEducationController {

    private final StaffEducationService service;

    @PostMapping
    public StaffEducationDto add(@Valid @RequestBody StaffEducationDto dto){
        return service.add(dto);
    }

    @GetMapping("/staff/{staffId}")
    public List<StaffEducationDto> byStaff(@PathVariable UUID staffId){
        return service.getByStaff(staffId);
    }
}
