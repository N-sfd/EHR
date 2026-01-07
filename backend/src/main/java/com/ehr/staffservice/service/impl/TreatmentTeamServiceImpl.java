package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.TreatmentTeamDto;
import com.ehr.staffservice.entity.TreatmentTeam;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.TreatmentTeamMapper;
import com.ehr.staffservice.repository.TreatmentTeamRepository;
import com.ehr.staffservice.service.TreatmentTeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TreatmentTeamServiceImpl implements TreatmentTeamService {

    private final TreatmentTeamRepository repository;
    private final TreatmentTeamMapper mapper;

    @Override
    @Transactional
    public TreatmentTeamDto create(TreatmentTeamDto dto) {
        TreatmentTeam entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("ACTIVE");
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public TreatmentTeamDto update(Long id, TreatmentTeamDto dto) {
        TreatmentTeam entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment team member not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public TreatmentTeamDto get(Long id) {
        TreatmentTeam entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Treatment team member not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Treatment team member not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<TreatmentTeamDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByIsPrimaryDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TreatmentTeamDto> getByStaffIdAndStatus(Long staffId, String status) {
        return repository.findByStaffIdAndStatus(staffId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }
}

