package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ProcedureDto;
import com.ehr.staffservice.entity.Procedure;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ProcedureMapper;
import com.ehr.staffservice.repository.ProcedureRepository;
import com.ehr.staffservice.service.ProcedureService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProcedureServiceImpl implements ProcedureService {

    private final ProcedureRepository repository;
    private final ProcedureMapper mapper;

    @Override
    @Transactional
    public ProcedureDto create(ProcedureDto dto) {
        Procedure entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus(Procedure.ProcedureStatus.SCHEDULED);
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ProcedureDto update(Long id, ProcedureDto dto) {
        Procedure entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ProcedureDto get(Long id) {
        Procedure entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procedure not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Procedure not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ProcedureDto> getByPatientId(Long patientId) {
        return repository.findByPatientId(patientId).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProcedureDto> getByPatientIdAndStatus(Long patientId, String status) {
        Procedure.ProcedureStatus procedureStatus = Procedure.ProcedureStatus.valueOf(status.toUpperCase());
        return repository.findByPatientIdAndStatus(patientId, procedureStatus).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProcedureDto> getByPatientIdAndDateRange(Long patientId, LocalDate startDate, LocalDate endDate) {
        return repository.findByPatientIdAndDateRange(patientId, startDate, endDate).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProcedureDto> getByPerformedByStaffIdAndDateRange(Long staffId, LocalDate startDate) {
        return repository.findByPerformedByStaffIdAndDateRange(staffId, startDate).stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}

