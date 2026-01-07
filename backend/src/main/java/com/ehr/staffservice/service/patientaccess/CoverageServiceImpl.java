package com.ehr.staffservice.service.patientaccess;

import com.ehr.staffservice.dto.patientaccess.CoverageDto;
import com.ehr.staffservice.entity.patientaccess.Coverage;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.patientaccess.CoverageMapper;
import com.ehr.staffservice.repository.patientaccess.CoverageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoverageServiceImpl implements CoverageService {
    private final CoverageRepository coverageRepository;
    private final CoverageMapper coverageMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CoverageDto> getCoveragesByPatientId(Long patientId) {
        List<Coverage> coverages = coverageRepository.findByPatientId(patientId);
        return coverages.stream()
                .map(coverageMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CoverageDto getPrimaryCoverage(Long patientId) {
        Coverage coverage = coverageRepository.findByPatientIdAndIsPrimaryTrue(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Primary coverage not found for patient: " + patientId));
        return coverageMapper.toDto(coverage);
    }

    @Override
    @Transactional
    public CoverageDto createCoverage(CoverageDto dto) {
        Coverage coverage = coverageMapper.toEntity(dto);
        
        // Set eligibility status enum
        if (dto.getEligibilityStatus() != null) {
            coverage.setEligibilityStatus(Coverage.EligibilityStatus.valueOf(dto.getEligibilityStatus()));
        }
        
        Coverage saved = coverageRepository.save(coverage);
        return coverageMapper.toDto(saved);
    }

    @Override
    @Transactional
    public CoverageDto updateCoverage(Long id, CoverageDto dto) {
        Coverage coverage = coverageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coverage not found with id: " + id));
        
        coverage.setPayer(dto.getPayer());
        coverage.setMemberId(dto.getMemberId());
        coverage.setGroupNumber(dto.getGroupNumber());
        coverage.setStartDate(dto.getStartDate());
        coverage.setEndDate(dto.getEndDate());
        if (dto.getEligibilityStatus() != null) {
            coverage.setEligibilityStatus(Coverage.EligibilityStatus.valueOf(dto.getEligibilityStatus()));
        }
        coverage.setCopay(dto.getCopay());
        coverage.setDeductible(dto.getDeductible());
        coverage.setIsPrimary(dto.getIsPrimary());
        
        Coverage saved = coverageRepository.save(coverage);
        return coverageMapper.toDto(saved);
    }
}

