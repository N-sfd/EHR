package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.CheckoutDto;
import com.ehr.staffservice.entity.Checkout;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.CheckoutMapper;
import com.ehr.staffservice.repository.CheckoutRepository;
import com.ehr.staffservice.service.CheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CheckoutServiceImpl implements CheckoutService {

    private final CheckoutRepository repository;
    private final CheckoutMapper mapper;

    @Override
    @Transactional
    public CheckoutDto create(CheckoutDto dto) {
        Checkout entity = mapper.toEntity(dto);
        if (entity.getCheckoutDateTime() == null) {
            entity.setCheckoutDateTime(LocalDateTime.now());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public CheckoutDto update(Long id, CheckoutDto dto) {
        Checkout entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public CheckoutDto get(Long id) {
        Checkout entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public Optional<CheckoutDto> getByEncounterId(Long encounterId) {
        return repository.findByEncounterId(encounterId).map(mapper::toDto);
    }

    @Override
    @Transactional
    public CheckoutDto complete(Long id) {
        Checkout entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checkout not found with id: " + id));
        entity.setIsComplete(true);
        entity.setCompletedDateTime(LocalDateTime.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

