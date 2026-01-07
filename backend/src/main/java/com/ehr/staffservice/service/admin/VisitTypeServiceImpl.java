package com.ehr.staffservice.service.admin;

import com.ehr.staffservice.dto.admin.VisitTypeDto;
import com.ehr.staffservice.entity.admin.VisitType;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.admin.VisitTypeMapper;
import com.ehr.staffservice.repository.admin.VisitTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VisitTypeServiceImpl implements VisitTypeService {
    private final VisitTypeRepository visitTypeRepository;
    private final VisitTypeMapper visitTypeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<VisitTypeDto> getAllVisitTypes() {
        return visitTypeRepository.findAll().stream()
                .map(visitTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<VisitTypeDto> getActiveVisitTypes() {
        return visitTypeRepository.findByIsActiveTrue().stream()
                .map(visitTypeMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VisitTypeDto getVisitTypeById(Long id) {
        VisitType visitType = visitTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Visit type not found with id: " + id));
        return visitTypeMapper.toDto(visitType);
    }

    @Override
    @Transactional
    public VisitTypeDto createVisitType(VisitTypeDto dto) {
        VisitType visitType = visitTypeMapper.toEntity(dto);
        VisitType saved = visitTypeRepository.save(visitType);
        return visitTypeMapper.toDto(saved);
    }
}

