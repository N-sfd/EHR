package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.DoctorLicenseDto;
import com.ehr.staffservice.entity.DoctorLicense;

@Mapper(componentModel = "spring")
public interface DoctorLicenseMapper {
    DoctorLicenseDto toDto(DoctorLicense entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    DoctorLicense toEntity(DoctorLicenseDto dto);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    void updateEntityFromDto(DoctorLicenseDto dto, @MappingTarget DoctorLicense entity);
}

