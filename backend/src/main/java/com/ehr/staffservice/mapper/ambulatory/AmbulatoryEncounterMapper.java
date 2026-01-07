package com.ehr.staffservice.mapper.ambulatory;

import com.ehr.staffservice.dto.ambulatory.EncounterDto;
import com.ehr.staffservice.entity.ambulatory.Encounter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AmbulatoryEncounterMapper {
    EncounterDto toDto(Encounter encounter);
    Encounter toEntity(EncounterDto dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(EncounterDto dto, @MappingTarget Encounter entity);
}

