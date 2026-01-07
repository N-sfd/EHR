package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.OrderDto;
import java.util.List;

public interface OrderService {
    OrderDto create(OrderDto dto);
    OrderDto update(Long id, OrderDto dto);
    OrderDto get(Long id);
    OrderDto getByOrderNumber(String orderNumber);
    void delete(Long id);
    List<OrderDto> getByPatientId(Long patientId);
    List<OrderDto> getByPatientIdAndStatus(Long patientId, String status);
    List<OrderDto> getActiveOrders(Long patientId);
    List<OrderDto> getByOrderType(String orderType);
    OrderDto verifyOrder(Long id, Long staffId);
    OrderDto discontinueOrder(Long id, Long staffId, String reason);
}

