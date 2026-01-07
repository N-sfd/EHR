package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.ProviderEncounterDto;
import com.ehr.staffservice.entity.ProviderEncounter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProviderEncounterMapper {
    ProviderEncounterDto toDto(ProviderEncounter entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ProviderEncounter toEntity(ProviderEncounterDto dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ProviderEncounterDto dto, @MappingTarget ProviderEncounter entity);
}

