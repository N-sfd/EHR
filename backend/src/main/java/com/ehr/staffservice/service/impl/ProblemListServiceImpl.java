package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ProblemListDto;
import com.ehr.staffservice.entity.ProblemList;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ProblemListMapper;
import com.ehr.staffservice.repository.ProblemListRepository;
import com.ehr.staffservice.service.ProblemListService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProblemListServiceImpl implements ProblemListService {

    private final ProblemListRepository repository;
    private final ProblemListMapper mapper;

    @Override
    @Transactional
    public ProblemListDto create(ProblemListDto dto) {
        ProblemList entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus(ProblemList.ProblemStatus.ACTIVE);
        }
        if (entity.getOnsetDate() == null) {
            entity.setOnsetDate(LocalDate.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ProblemListDto update(Long id, ProblemListDto dto) {
        ProblemList entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ProblemListDto get(Long id) {
        ProblemList entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Problem not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ProblemListDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProblemListDto> getActiveProblemsByPatientId(Long patientId) {
        return repository.findActiveProblemsByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProblemListDto> getByPatientIdAndStatus(Long patientId, String status) {
        ProblemList.ProblemStatus problemStatus = ProblemList.ProblemStatus.valueOf(status.toUpperCase());
        return repository.findByPatientIdAndStatus(patientId, problemStatus).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ProblemListDto resolve(Long id, Long resolvedByStaffId) {
        ProblemList entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found with id: " + id));
        entity.setStatus(ProblemList.ProblemStatus.RESOLVED);
        entity.setResolvedDate(LocalDate.now());
        entity.setResolvedByStaffId(resolvedByStaffId);
        entity.setActive(false);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

