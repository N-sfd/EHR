package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.RoomingDto;
import com.ehr.staffservice.entity.Rooming;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.RoomingMapper;
import com.ehr.staffservice.repository.RoomingRepository;
import com.ehr.staffservice.service.RoomingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomingServiceImpl implements RoomingService {

    private final RoomingRepository repository;
    private final RoomingMapper mapper;

    @Override
    @Transactional
    public RoomingDto create(RoomingDto dto) {
        Rooming entity = mapper.toEntity(dto);
        if (entity.getRoomedDateTime() == null) {
            entity.setRoomedDateTime(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public RoomingDto update(Long id, RoomingDto dto) {
        Rooming entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rooming not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public RoomingDto get(Long id) {
        Rooming entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rooming not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public Optional<RoomingDto> getByEncounterId(Long encounterId) {
        return repository.findByEncounterId(encounterId).map(mapper::toDto);
    }

    @Override
    public Optional<RoomingDto> getByAppointmentId(Long appointmentId) {
        return repository.findByAppointmentId(appointmentId).map(mapper::toDto);
    }

    @Override
    @Transactional
    public RoomingDto complete(Long id) {
        Rooming entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rooming not found with id: " + id));
        entity.setIsComplete(true);
        entity.setCompletedDateTime(LocalDateTime.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

