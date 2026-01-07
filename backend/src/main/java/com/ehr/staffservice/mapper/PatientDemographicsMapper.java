package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.PatientDemographicsDto;
import com.ehr.staffservice.entity.PatientDemographics;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientDemographicsMapper {
    PatientDemographicsDto toDto(PatientDemographics entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    PatientDemographics toEntity(PatientDemographicsDto dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(PatientDemographicsDto dto, @MappingTarget PatientDemographics entity);
}

