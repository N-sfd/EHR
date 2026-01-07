package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.StaffAwardDto;
import com.ehr.staffservice.service.StaffAwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/awards")
@RequiredArgsConstructor
public class StaffAwardController {

    private final StaffAwardService service;

    @PostMapping
    public StaffAwardDto add(@Valid @RequestBody StaffAwardDto dto){
        return service.add(dto);
    }

    @GetMapping("/staff/{staffId}")
    public List<StaffAwardDto> byStaff(@PathVariable UUID staffId){
        return service.getByStaff(staffId);
    }
}
