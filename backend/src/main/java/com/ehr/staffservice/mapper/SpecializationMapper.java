package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.SpecializationDto;
import com.ehr.staffservice.entity.Specialization;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface SpecializationMapper {
    @Mapping(target = "specializationId", source = "specializationId")
    @Mapping(target = "departmentId", source = "department.departmentId")
    SpecializationDto toDto(Specialization entity);
    
    @Mapping(target = "specializationId", source = "specializationId")
    @Mapping(target = "department", ignore = true) // Handle department separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Specialization toEntity(SpecializationDto dto);
    
    @Mapping(target = "specializationId", source = "specializationId")
    @Mapping(target = "department", ignore = true) // Handle department separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(SpecializationDto dto, @MappingTarget Specialization entity);
}

