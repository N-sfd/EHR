package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.EncounterDto;
import com.ehr.staffservice.entity.Encounter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EncounterMapper {
    EncounterDto toDto(Encounter entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "encounterNumber", ignore = true)
    @Mapping(target = "checkInDateTime", ignore = true)
    @Mapping(target = "checkInByStaffId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Encounter toEntity(EncounterDto dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "encounterNumber", ignore = true)
    @Mapping(target = "checkInDateTime", ignore = true)
    @Mapping(target = "checkInByStaffId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(EncounterDto dto, @MappingTarget Encounter entity);
}

