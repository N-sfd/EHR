package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.SpecializationDto;
import com.ehr.staffservice.service.SpecializationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specializations")
@RequiredArgsConstructor
public class SpecializationController {

    private final SpecializationService service;

    @PostMapping
    public SpecializationDto create(@Valid @RequestBody SpecializationDto dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<SpecializationDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public SpecializationDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public SpecializationDto update(@PathVariable Long id,
                               @Valid @RequestBody SpecializationDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

