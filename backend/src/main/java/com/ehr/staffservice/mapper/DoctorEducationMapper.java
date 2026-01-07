package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.DoctorEducationDto;
import com.ehr.staffservice.entity.DoctorEducation;

@Mapper(componentModel = "spring")
public interface DoctorEducationMapper {
    DoctorEducationDto toDto(DoctorEducation entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    DoctorEducation toEntity(DoctorEducationDto dto);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    void updateEntityFromDto(DoctorEducationDto dto, @MappingTarget DoctorEducation entity);
}

