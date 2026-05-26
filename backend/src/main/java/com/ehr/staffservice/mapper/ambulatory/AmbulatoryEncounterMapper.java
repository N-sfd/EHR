package com.ehr.staffservice.mapper.ambulatory;

import com.ehr.staffservice.dto.ambulatory.EncounterDto;
import com.ehr.staffservice.entity.ambulatory.Encounter;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AmbulatoryEncounterMapper {
    
    @Mapping(target = "status", source = "status", qualifiedByName = "statusToString")
    EncounterDto toDto(Encounter encounter);
    
    @Mapping(target = "status", source = "status", qualifiedByName = "stringToStatus")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Encounter toEntity(EncounterDto dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "status", ignore = true) // Status should be updated separately
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(EncounterDto dto, @MappingTarget Encounter entity);
    
    @Named("statusToString")
    default String statusToString(Encounter.EncounterStatus status) {
        return status != null ? status.name() : null;
    }
    
    @Named("stringToStatus")
    default Encounter.EncounterStatus stringToStatus(String status) {
        if (status == null || status.isEmpty()) {
            return Encounter.EncounterStatus.ROOMING; // Default
        }
        try {
            return Encounter.EncounterStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Encounter.EncounterStatus.ROOMING; // Default on invalid
        }
    }
}

