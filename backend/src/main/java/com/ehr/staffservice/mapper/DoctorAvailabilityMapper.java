package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.DoctorAvailabilityDto;
import com.ehr.staffservice.entity.DoctorAvailability;

@Mapper(componentModel = "spring")
public interface DoctorAvailabilityMapper {
    DoctorAvailabilityDto toDto(DoctorAvailability entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    DoctorAvailability toEntity(DoctorAvailabilityDto dto);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    void updateEntityFromDto(DoctorAvailabilityDto dto, @MappingTarget DoctorAvailability entity);
}

