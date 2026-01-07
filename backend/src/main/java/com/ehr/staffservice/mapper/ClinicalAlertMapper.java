package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.ClinicalAlertDto;
import com.ehr.staffservice.entity.ClinicalAlert;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClinicalAlertMapper {
    ClinicalAlertDto toDto(ClinicalAlert entity);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "triggeredAt", ignore = true)
    @Mapping(target = "acknowledgedAt", ignore = true)
    @Mapping(target = "acknowledgedByStaffId", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "resolvedByStaffId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ClinicalAlert toEntity(ClinicalAlertDto dto);
    
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "triggeredAt", ignore = true)
    @Mapping(target = "acknowledgedAt", ignore = true)
    @Mapping(target = "acknowledgedByStaffId", ignore = true)
    @Mapping(target = "resolvedAt", ignore = true)
    @Mapping(target = "resolvedByStaffId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ClinicalAlertDto dto, @MappingTarget ClinicalAlert entity);
}

