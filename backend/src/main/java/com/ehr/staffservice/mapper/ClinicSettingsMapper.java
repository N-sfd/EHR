package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.ClinicSettingsDto;
import com.ehr.staffservice.entity.ClinicSettings;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ClinicSettingsMapper {
    ClinicSettingsDto toDto(ClinicSettings entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ClinicSettings toEntity(ClinicSettingsDto dto);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ClinicSettingsDto dto, @MappingTarget ClinicSettings entity);
}

