package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.LabResultDto;
import com.ehr.staffservice.entity.LabResult;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.LabResultMapper;
import com.ehr.staffservice.repository.LabResultRepository;
import com.ehr.staffservice.service.LabResultService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LabResultServiceImpl implements LabResultService {

    private final LabResultRepository repository;
    private final LabResultMapper mapper;

    @Override
    @Transactional
    public LabResultDto create(LabResultDto dto) {
        LabResult entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("PENDING");
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public LabResultDto update(Long id, LabResultDto dto) {
        LabResult entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public LabResultDto get(Long id) {
        LabResult entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Lab result not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<LabResultDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByResultedDateTimeDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabResultDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByResultedDateTimeDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabResultDto> getByPatientIdAndCategory(Long patientId, String category) {
        return repository.findByPatientIdAndTestCategoryOrderByResultedDateTimeDesc(patientId, category)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<LabResultDto> getCriticalResults() {
        return repository.findByIsCriticalAndCriticalValueNotifiedOrderByResultedDateTimeDesc(true, false)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LabResultDto markCriticalAsNotified(Long id, Long staffId) {
        LabResult entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lab result not found with id: " + id));
        entity.setCriticalValueNotified(true);
        entity.setNotifiedToStaffId(staffId);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

