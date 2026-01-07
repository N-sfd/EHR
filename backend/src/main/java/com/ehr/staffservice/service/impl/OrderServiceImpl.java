package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.OrderDto;
import com.ehr.staffservice.entity.Order;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.OrderMapper;
import com.ehr.staffservice.repository.OrderRepository;
import com.ehr.staffservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository repository;
    private final OrderMapper mapper;

    private String generateOrderNumber() {
        return "ORD-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    @Override
    @Transactional
    public OrderDto create(OrderDto dto) {
        Order entity = mapper.toEntity(dto);
        if (entity.getStatus() == null) {
            entity.setStatus("PENDING");
        }
        if (entity.getOrderNumber() == null) {
            entity.setOrderNumber(generateOrderNumber());
        }
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public OrderDto update(Long id, OrderDto dto) {
        Order entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        mapper.updateEntityFromDto(dto, entity);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    public OrderDto get(Long id) {
        Order entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return mapper.toDto(entity);
    }

    @Override
    public OrderDto getByOrderNumber(String orderNumber) {
        Order entity = repository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Order not found with id: " + id);
        }
        repository.deleteById(id);
    }

    @Override
    public List<OrderDto> getByPatientId(Long patientId) {
        return repository.findByPatientIdOrderByStartDateTimeDesc(patientId)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getByPatientIdAndStatus(Long patientId, String status) {
        return repository.findByPatientIdAndStatusOrderByStartDateTimeDesc(patientId, status)
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<OrderDto> getActiveOrders(Long patientId) {
        return getByPatientIdAndStatus(patientId, "ACTIVE");
    }

    @Override
    public List<OrderDto> getByOrderType(String orderType) {
        return repository.findByOrderTypeAndStatusOrderByStartDateTimeDesc(orderType, "ACTIVE")
                .stream()
                .map(mapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public OrderDto verifyOrder(Long id, Long staffId) {
        Order entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        entity.setStatus("ACTIVE");
        entity.setVerifiedByStaffId(staffId);
        entity.setVerifiedDateTime(LocalDateTime.now());
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }

    @Override
    @Transactional
    public OrderDto discontinueOrder(Long id, Long staffId, String reason) {
        Order entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        entity.setStatus("CANCELLED");
        entity.setDiscontinuedByStaffId(staffId);
        entity.setDiscontinuedDateTime(LocalDateTime.now());
        entity.setDiscontinuationReason(reason);
        entity = repository.save(entity);
        return mapper.toDto(entity);
    }
}

