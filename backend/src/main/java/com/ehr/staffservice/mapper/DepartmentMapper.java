package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.DepartmentDto;
import com.ehr.staffservice.entity.Department;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DepartmentMapper {
    DepartmentDto toDto(Department entity);
    
    @Mapping(target = "departmentId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Department toEntity(DepartmentDto dto);
    
    @Mapping(target = "departmentId", ignore = true) // Don't update the ID
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(DepartmentDto dto, @MappingTarget Department entity);
}

