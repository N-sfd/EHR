package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.ehr.staffservice.dto.StaffCertificationDto;
import com.ehr.staffservice.entity.StaffCertification;

@Mapper(componentModel = "spring")
public interface StaffCertificationMapper {
    StaffCertificationDto toDto(StaffCertification entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    StaffCertification toEntity(StaffCertificationDto dto);
}
