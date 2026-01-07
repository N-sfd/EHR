package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.ServiceDto;
import com.ehr.staffservice.entity.Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ServiceMapper {
    
    @Mapping(target = "departmentName", source = "department.name", ignore = true)
    ServiceDto toDto(Service entity);
    
    @Mapping(target = "serviceId", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Service toEntity(ServiceDto dto);
    
    @Mapping(target = "serviceId", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ServiceDto dto, @MappingTarget Service entity);
}

