package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.MedicationDto;
import com.ehr.staffservice.entity.Medication;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MedicationMapper {
    MedicationDto toDto(Medication entity);
    
    @Mapping(target = "medicationId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Medication toEntity(MedicationDto dto);
    
    @Mapping(target = "medicationId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(MedicationDto dto, @MappingTarget Medication entity);
}

