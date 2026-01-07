package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.PatientDto;
import com.ehr.staffservice.entity.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", 
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PatientMapper {
    
    PatientDto toDto(Patient entity);
    
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Patient toEntity(PatientDto dto);
    
    @Mapping(target = "patientId", ignore = true)
    @Mapping(target = "patientCode", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(PatientDto dto, @MappingTarget Patient entity);
}

