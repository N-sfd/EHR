package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.LabResultDto;
import com.ehr.staffservice.entity.LabResult;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface LabResultMapper {
    LabResultDto toDto(LabResult entity);
    
    @Mapping(target = "resultId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "orderingProvider", ignore = true)
    @Mapping(target = "items", ignore = true)
    LabResult toEntity(LabResultDto dto);
    
    @Mapping(target = "resultId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "patient", ignore = true)
    @Mapping(target = "orderingProvider", ignore = true)
    @Mapping(target = "items", ignore = true)
    void updateEntityFromDto(LabResultDto dto, @MappingTarget LabResult entity);
}

