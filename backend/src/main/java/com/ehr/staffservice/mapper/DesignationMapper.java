package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.DesignationDto;
import com.ehr.staffservice.entity.Designation;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface DesignationMapper {
    @Mapping(target = "designationId", source = "designationId")
    @Mapping(target = "departmentId", source = "department.departmentId")
    DesignationDto toDto(Designation entity);
    
    @Mapping(target = "designationId", source = "designationId")
    @Mapping(target = "department", ignore = true) // Handle department separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Designation toEntity(DesignationDto dto);
    
    @Mapping(target = "designationId", source = "designationId")
    @Mapping(target = "department", ignore = true) // Handle department separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(DesignationDto dto, @MappingTarget Designation entity);
}

