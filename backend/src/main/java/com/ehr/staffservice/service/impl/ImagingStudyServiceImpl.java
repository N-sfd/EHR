package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ImagingStudyDto;
import com.ehr.staffservice.entity.ImagingStudy;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ImagingStudyMapper;
import com.ehr.staffservice.repository.ImagingStudyRepository;
import com.ehr.staffservice.service.ImagingStudyService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImagingStudyServiceImpl implements ImagingStudyService {

    private final ImagingStudyRepository repository;
    private final ImagingStudyMapper mapper;

    private String generateStudyNumber() {
        return "IMG-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Override
    @Transactional
    public ImagingStudyDto create(ImagingStudyDto dto) {
        ImagingStudy entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("SCHEDULED");
        }
        if (entity.getStudyNumber() == null) {
            entity.setStudyNumber(generateStudyNumber());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ImagingStudyDto update(Long id, ImagingStudyDto dto) {
        ImagingStudy entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ImagingStudyDto get(Long id) {
        ImagingStudy entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public ImagingStudyDto getByStudyNumber(String studyNumber) {
        ImagingStudy entity = repository.findByStudyNumber(studyNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with study number: " + studyNumber));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Imaging study not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ImagingStudyDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByScheduledDateTimeDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImagingStudyDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByScheduledDateTimeDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImagingStudyDto> getByStudyType(String studyType) {
        return repository.findByStudyTypeOrderByScheduledDateTimeDesc(studyType)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ImagingStudyDto> getPreliminaryStudies() {
        return repository.findByIsPreliminaryOrderByCompletedDateTimeDesc(true)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ImagingStudyDto completeStudy(Long id, Long staffId, String findings, String impression) {
        ImagingStudy entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Imaging study not found with id: " + id));
        entity.setStatus("FINAL");
        entity.setCompletedDateTime(LocalDateTime.now());
        entity.setInterpretedByStaffId(staffId);
        entity.setFindings(findings);
        entity.setImpression(impression);
        entity.setIsPreliminary(false);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

