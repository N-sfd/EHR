package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.DesignationDto;
import com.ehr.staffservice.service.DesignationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/designations")
@RequiredArgsConstructor
public class DesignationController {

    private final DesignationService service;

    @PostMapping
    public DesignationDto create(@Valid @RequestBody DesignationDto dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<DesignationDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DesignationDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public DesignationDto update(@PathVariable Long id,
                                 @Valid @RequestBody DesignationDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

