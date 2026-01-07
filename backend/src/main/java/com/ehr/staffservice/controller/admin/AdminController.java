package com.ehr.staffservice.controller.admin;

import com.ehr.staffservice.dto.admin.VisitTypeDto;
import com.ehr.staffservice.response.ApiResponse;
import com.ehr.staffservice.service.admin.VisitTypeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/visit-types")
@RequiredArgsConstructor
public class AdminController {
    private final VisitTypeService visitTypeService;

    @GetMapping
    public ResponseEntity<ApiResponse> getVisitTypes() {
        List<VisitTypeDto> visitTypes = visitTypeService.getActiveVisitTypes();
        return ResponseEntity.ok(ApiResponse.ok(visitTypes, "Visit types retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getVisitTypeById(@PathVariable Long id) {
        VisitTypeDto visitType = visitTypeService.getVisitTypeById(id);
        return ResponseEntity.ok(ApiResponse.ok(visitType, "Visit type retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse> createVisitType(
            @Valid @RequestBody VisitTypeDto dto) {
        VisitTypeDto created = visitTypeService.createVisitType(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok(created, "Visit type created successfully"));
    }
}

