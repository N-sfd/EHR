package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.ehr.staffservice.dto.StaffLicenseDto;
import com.ehr.staffservice.entity.StaffLicense;

@Mapper(componentModel = "spring")
public interface StaffLicenseMapper {
    StaffLicenseDto toDto(StaffLicense entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    StaffLicense toEntity(StaffLicenseDto dto);
}
