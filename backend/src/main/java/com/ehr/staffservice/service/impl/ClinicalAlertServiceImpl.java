package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ClinicalAlertDto;
import com.ehr.staffservice.entity.ClinicalAlert;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ClinicalAlertMapper;
import com.ehr.staffservice.repository.ClinicalAlertRepository;
import com.ehr.staffservice.service.ClinicalAlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalAlertServiceImpl implements ClinicalAlertService {

    private final ClinicalAlertRepository repository;
    private final ClinicalAlertMapper mapper;

    @Override
    @Transactional
    public ClinicalAlertDto create(ClinicalAlertDto dto) {
        ClinicalAlert entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus(ClinicalAlert.AlertStatus.ACTIVE);
        }
        if (entity.getTriggeredAt() == null) {
            entity.setTriggeredAt(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ClinicalAlertDto update(Long id, ClinicalAlertDto dto) {
        ClinicalAlert entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical alert not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ClinicalAlertDto get(Long id) {
        ClinicalAlert entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical alert not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Clinical alert not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ClinicalAlertDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClinicalAlertDto> getActiveAlertsByPatientId(Long patientId) {
        return repository.findActiveAlertsByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClinicalAlertDto> getActiveAlerts() {
        return repository.findActiveAlerts(LocalDateTime.now()).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClinicalAlertDto> getByStatus(String status) {
        ClinicalAlert.AlertStatus alertStatus = ClinicalAlert.AlertStatus.valueOf(status.toUpperCase());
        return repository.findByStatus(alertStatus).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClinicalAlertDto acknowledge(Long id, Long staffId) {
        ClinicalAlert entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical alert not found with id: " + id));
        entity.setStatus(ClinicalAlert.AlertStatus.ACKNOWLEDGED);
        entity.setAcknowledgedAt(LocalDateTime.now());
        entity.setAcknowledgedByStaffId(staffId);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ClinicalAlertDto resolve(Long id, Long staffId) {
        ClinicalAlert entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical alert not found with id: " + id));
        entity.setStatus(ClinicalAlert.AlertStatus.RESOLVED);
        entity.setResolvedAt(LocalDateTime.now());
        entity.setResolvedByStaffId(staffId);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

