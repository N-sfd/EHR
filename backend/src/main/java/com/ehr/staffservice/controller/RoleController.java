package com.ehr.staffservice.controller;

import com.ehr.staffservice.dto.RoleDto;
import com.ehr.staffservice.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class RoleController {

    private final RoleService service;

    @PostMapping
    public RoleDto create(@Valid @RequestBody RoleDto dto) {
        return service.create(dto);
    }

    @GetMapping
    public List<RoleDto> all() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public RoleDto get(@PathVariable Long id) {
        return service.get(id);
    }

    @PutMapping("/{id}")
    public RoleDto update(@PathVariable Long id,
                          @Valid @RequestBody RoleDto dto) {
        return service.update(id, dto);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}

