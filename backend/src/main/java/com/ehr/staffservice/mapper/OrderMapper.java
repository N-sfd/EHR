package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.OrderDto;
import com.ehr.staffservice.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {
    OrderDto toDto(Order entity);
    
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "orderNumber", ignore = true)
    @Mapping(target = "verifiedByStaffId", ignore = true)
    @Mapping(target = "verifiedDateTime", ignore = true)
    @Mapping(target = "discontinuedByStaffId", ignore = true)
    @Mapping(target = "discontinuedDateTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Order toEntity(OrderDto dto);
    
    @Mapping(target = "orderId", ignore = true)
    @Mapping(target = "orderNumber", ignore = true)
    @Mapping(target = "verifiedByStaffId", ignore = true)
    @Mapping(target = "verifiedDateTime", ignore = true)
    @Mapping(target = "discontinuedByStaffId", ignore = true)
    @Mapping(target = "discontinuedDateTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(OrderDto dto, @MappingTarget Order entity);
}

