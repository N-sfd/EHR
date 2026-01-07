package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.CarePlanDto;
import com.ehr.staffservice.entity.CarePlan;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.CarePlanMapper;
import com.ehr.staffservice.repository.CarePlanRepository;
import com.ehr.staffservice.service.CarePlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarePlanServiceImpl implements CarePlanService {

    private final CarePlanRepository repository;
    private final CarePlanMapper mapper;

    @Override
    @Transactional
    public CarePlanDto create(CarePlanDto dto) {
        CarePlan entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("ACTIVE");
        }
        if (entity.getStartDate() == null) {
            entity.setStartDate(LocalDate.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public CarePlanDto update(Long id, CarePlanDto dto) {
        CarePlan entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public CarePlanDto get(Long id) {
        CarePlan entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Care plan not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<CarePlanDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByStartDateDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<CarePlanDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByStartDateDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CarePlanDto resolve(Long id) {
        CarePlan entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Care plan not found with id: " + id));
        entity.setStatus("RESOLVED");
        entity.setResolvedDate(LocalDate.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

