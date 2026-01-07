package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.TreatmentTeamDto;
import com.ehr.staffservice.entity.TreatmentTeam;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TreatmentTeamMapper {
    TreatmentTeamDto toDto(TreatmentTeam entity);
    
    @Mapping(target = "treatmentTeamId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    TreatmentTeam toEntity(TreatmentTeamDto dto);
    
    @Mapping(target = "treatmentTeamId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(TreatmentTeamDto dto, @MappingTarget TreatmentTeam entity);
}

