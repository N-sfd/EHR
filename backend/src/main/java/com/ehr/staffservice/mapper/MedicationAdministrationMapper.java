package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.MedicationAdministrationDto;
import com.ehr.staffservice.entity.MedicationAdministration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MedicationAdministrationMapper {
    MedicationAdministrationDto toDto(MedicationAdministration entity);
    
    @Mapping(target = "administrationId", ignore = true)
    @Mapping(target = "administeredTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    MedicationAdministration toEntity(MedicationAdministrationDto dto);
    
    @Mapping(target = "administrationId", ignore = true)
    @Mapping(target = "administeredTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(MedicationAdministrationDto dto, @MappingTarget MedicationAdministration entity);
}

