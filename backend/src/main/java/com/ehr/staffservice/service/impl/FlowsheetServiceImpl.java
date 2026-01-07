package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.FlowsheetDto;
import com.ehr.staffservice.entity.Flowsheet;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.FlowsheetMapper;
import com.ehr.staffservice.repository.FlowsheetRepository;
import com.ehr.staffservice.service.FlowsheetService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlowsheetServiceImpl implements FlowsheetService {

    private final FlowsheetRepository repository;
    private final FlowsheetMapper mapper;

    @Override
    @Transactional
    public FlowsheetDto create(FlowsheetDto dto) {
        Flowsheet entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus(Flowsheet.FlowsheetStatus.DRAFT);
        }
        if (entity.getRecordedAt() == null) {
            entity.setRecordedAt(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public FlowsheetDto update(Long id, FlowsheetDto dto) {
        Flowsheet entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flowsheet not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public FlowsheetDto get(Long id) {
        Flowsheet entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flowsheet not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Flowsheet not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<FlowsheetDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FlowsheetDto> getByPatientIdAndFlowsheetType(Long patientId, String flowsheetType) {
        return repository.findByPatientIdAndFlowsheetType(patientId, flowsheetType).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<FlowsheetDto> getByPatientIdAndDateRange(Long patientId, LocalDateTime startDate, LocalDateTime endDate) {
        return repository.findByPatientIdAndDateRange(patientId, startDate, endDate).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}

