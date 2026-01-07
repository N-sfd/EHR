package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.CarePlanDto;
import com.ehr.staffservice.entity.CarePlan;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CarePlanMapper {
    CarePlanDto toDto(CarePlan entity);
    
    @Mapping(target = "carePlanId", ignore = true)
    @Mapping(target = "resolvedDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    CarePlan toEntity(CarePlanDto dto);
    
    @Mapping(target = "carePlanId", ignore = true)
    @Mapping(target = "resolvedDate", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(CarePlanDto dto, @MappingTarget CarePlan entity);
}

