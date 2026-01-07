package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.PermissionDto;
import com.ehr.staffservice.service.PermissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/rbac/permissions")
@RequiredArgsConstructor
public class PermissionController {

    private final PermissionService service;

    @GetMapping
    public List<PermissionDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public PermissionDto one(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    public PermissionDto create(@Valid @RequestBody PermissionDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public PermissionDto update(@PathVariable Long id, @Valid @RequestBody PermissionDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

