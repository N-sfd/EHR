package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.LabResultDto;
import com.ehr.staffservice.dto.LabResultItemDto;
import com.ehr.staffservice.entity.LabResult;
import com.ehr.staffservice.entity.LabResultItem;
import com.ehr.staffservice.repository.LabResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabResultService {

    private final LabResultRepository labResultRepository;

    /**
     * Get all lab results for a patient within a date range.
     * Defaults to last 12 months if dates not provided.
     */
    @Transactional(readOnly = true)
    public List<LabResultDto> getLabResultsForPatient(Long patientId, LocalDate fromDate, LocalDate toDate) {
        // Default to last 12 months if not provided
        if (fromDate == null) {
            fromDate = LocalDate.now().minusMonths(12);
        }
        if (toDate == null) {
            toDate = LocalDate.now();
        }

        List<LabResult> results = labResultRepository.findByPatientIdAndDateRange(patientId, fromDate, toDate);
        return results.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    /**
     * Get a specific lab result by ID.
     */
    @Transactional(readOnly = true)
    public LabResultDto getLabResultById(Long resultId, Long patientId) {
        LabResult result = labResultRepository.findByIdAndPatientId(resultId, patientId)
                .orElseThrow(() -> new RuntimeException("Lab result not found or access denied"));
        return mapToDto(result);
    }

    /**
     * Map LabResult entity to DTO.
     */
    private LabResultDto mapToDto(LabResult result) {
        LabResultDto dto = new LabResultDto();
        dto.setResultId(result.getResultId());
        dto.setPatientId(result.getPatient().getPatientId());
        dto.setPanelName(result.getPanelName());
        dto.setOrderDate(result.getOrderDate());
        dto.setResultDate(result.getResultDate());
        dto.setStatus(result.getStatus().name());
        dto.setLabName(result.getLabName());
        dto.setFacility(result.getLabName()); // Use labName as facility

        // Map collectedAt and resultedAt (stub: use resultDate if available)
        if (result.getResultDate() != null) {
            // Stub: use resultDate at noon as collectedAt
            dto.setCollectedAt(result.getResultDate().atTime(12, 0));
            // Stub: use resultDate at 2pm as resultedAt (if status is FINAL)
            if (result.getStatus() == LabResult.ResultStatus.FINAL) {
                dto.setResultedAt(result.getResultDate().atTime(14, 0));
            }
        }

        if (result.getOrderingProvider() != null) {
            dto.setOrderingProviderId(result.getOrderingProvider().getStaffId());
            dto.setOrderingProviderName(
                    result.getOrderingProvider().getFirstName() + " " + result.getOrderingProvider().getLastName()
            );
        }

        // Map items
        List<LabResultItemDto> items = result.getItems().stream()
                .map(this::mapItemToDto)
                .collect(Collectors.toList());
        dto.setItems(items);

        // Count abnormal items
        long abnormalCount = items.stream()
                .filter(item -> Boolean.TRUE.equals(item.getAbnormal()))
                .count();
        dto.setAbnormalCount((int) abnormalCount);

        // Stub: comments and attachments (null for now)
        dto.setComments(null);
        dto.setAttachments(null);

        // Compute and set overall status (NORMAL, ABNORMAL, CRITICAL)
        String overallStatus = computeOverallStatus(dto);
        dto.setOverallStatus(overallStatus);

        return dto;
    }

    /**
     * Compute overall status from abnormal count and items.
     */
    private String computeOverallStatus(LabResultDto dto) {
        if (dto.getAbnormalCount() == null || dto.getAbnormalCount() == 0) {
            return "NORMAL";
        }
        // Check if any item is CRITICAL
        if (dto.getItems() != null) {
            boolean hasCritical = dto.getItems().stream()
                    .anyMatch(item -> item.getFlag() != null && "CRITICAL".equals(item.getFlag()));
            if (hasCritical) {
                return "CRITICAL";
            }
        }
        return "ABNORMAL";
    }

    /**
     * Map LabResultItem entity to DTO.
     */
    private LabResultItemDto mapItemToDto(LabResultItem item) {
        LabResultItemDto dto = new LabResultItemDto();
        dto.setItemId(item.getItemId());
        dto.setTestName(item.getTestName());
        dto.setValue(item.getValue());
        dto.setUnits(item.getUnits());
        dto.setReferenceRange(item.getReferenceRange());
        dto.setAbnormal(item.getAbnormal());

        if (item.getFlag() != null) {
            dto.setFlag(item.getFlag().name());
        }

        return dto;
    }
}
