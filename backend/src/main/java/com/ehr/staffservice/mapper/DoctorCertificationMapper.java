package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.DoctorCertificationDto;
import com.ehr.staffservice.entity.DoctorCertification;

@Mapper(componentModel = "spring")
public interface DoctorCertificationMapper {
    DoctorCertificationDto toDto(DoctorCertification entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    DoctorCertification toEntity(DoctorCertificationDto dto);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    void updateEntityFromDto(DoctorCertificationDto dto, @MappingTarget DoctorCertification entity);
}

