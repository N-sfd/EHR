package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.DepartmentDto;
import com.ehr.staffservice.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService service;

    @PostMapping
    public DepartmentDto create(@Valid @RequestBody DepartmentDto dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<DepartmentDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public DepartmentDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public DepartmentDto update(@PathVariable Long id,
                                @Valid @RequestBody DepartmentDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

