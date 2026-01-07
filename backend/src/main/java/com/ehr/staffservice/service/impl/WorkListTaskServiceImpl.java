package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.WorkListTaskDto;
import com.ehr.staffservice.entity.WorkListTask;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.WorkListTaskMapper;
import com.ehr.staffservice.repository.WorkListTaskRepository;
import com.ehr.staffservice.service.WorkListTaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkListTaskServiceImpl implements WorkListTaskService {

    private final WorkListTaskRepository repository;
    private final WorkListTaskMapper mapper;

    @Override
    @Transactional
    public WorkListTaskDto create(WorkListTaskDto dto) {
        WorkListTask entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("PENDING");
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public WorkListTaskDto update(Long id, WorkListTaskDto dto) {
        WorkListTask entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work list task not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public WorkListTaskDto get(Long id) {
        WorkListTask entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work list task not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Work list task not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<WorkListTaskDto> getAll() {
        return repository.findAll().stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkListTaskDto> getByStaffId(Long staffId) {
        return repository.findByAssignedToStaffIdAndStatusOrderByDueDateTimeAsc(staffId, "PENDING")
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkListTaskDto> getByStaffIdAndStatus(Long staffId, String status) {
        return repository.findByAssignedToStaffIdAndStatusOrderByDueDateTimeAsc(staffId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkListTaskDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByDueDateTimeAsc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WorkListTaskDto completeTask(Long id) {
        WorkListTask entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Work list task not found with id: " + id));
        entity.setStatus("COMPLETED");
        entity.setCompletedAt(LocalDateTime.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

