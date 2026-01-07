package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.ehr.staffservice.dto.StaffEducationDto;
import com.ehr.staffservice.entity.StaffEducation;

@Mapper(componentModel = "spring")
public interface StaffEducationMapper {
    StaffEducationDto toDto(StaffEducation entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    StaffEducation toEntity(StaffEducationDto dto);
}
