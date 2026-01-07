package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ClinicalNoteDto;
import com.ehr.staffservice.entity.ClinicalNote;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.ClinicalNoteMapper;
import com.ehr.staffservice.repository.ClinicalNoteRepository;
import com.ehr.staffservice.service.ClinicalNoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClinicalNoteServiceImpl implements ClinicalNoteService {

    private final ClinicalNoteRepository repository;
    private final ClinicalNoteMapper mapper;

    @Override
    @Transactional
    public ClinicalNoteDto create(ClinicalNoteDto dto) {
        ClinicalNote entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("DRAFT");
        }
        if (entity.getNoteDateTime() == null) {
            entity.setNoteDateTime(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ClinicalNoteDto update(Long id, ClinicalNoteDto dto) {
        ClinicalNote entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical note not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public ClinicalNoteDto get(Long id) {
        ClinicalNote entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical note not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Clinical note not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<ClinicalNoteDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByNoteDateTimeDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClinicalNoteDto> getByPatientIdAndNoteType(Long patientId, String noteType) {
        return repository.findByPatientIdAndNoteTypeOrderByNoteDateTimeDesc(patientId, noteType)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<ClinicalNoteDto> getByStaffId(Long staffId) {
        return repository.findByAuthorStaffIdOrderByNoteDateTimeDesc(staffId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ClinicalNoteDto signNote(Long id) {
        ClinicalNote entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical note not found with id: " + id));
        entity.setIsSigned(true);
        entity.setSignedDateTime(LocalDateTime.now());
        entity.setStatus("FINAL");
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public ClinicalNoteDto cosignNote(Long id, Long cosignerStaffId) {
        ClinicalNote entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Clinical note not found with id: " + id));
        entity.setCosignedByStaffId(cosignerStaffId);
        entity.setCosignedDateTime(LocalDateTime.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

