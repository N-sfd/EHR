package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.VitalSignDto;
import com.ehr.staffservice.entity.VitalSign;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface VitalSignMapper {
    VitalSignDto toDto(VitalSign entity);
    
    @Mapping(target = "vitalSignId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    VitalSign toEntity(VitalSignDto dto);
    
    @Mapping(target = "vitalSignId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(VitalSignDto dto, @MappingTarget VitalSign entity);
}

