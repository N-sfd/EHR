package com.ehr.staffservice.mapper.admin;

import com.ehr.staffservice.dto.admin.VisitTypeDto;
import com.ehr.staffservice.entity.admin.VisitType;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface VisitTypeMapper {
    VisitTypeDto toDto(VisitType visitType);
    VisitType toEntity(VisitTypeDto dto);
}

