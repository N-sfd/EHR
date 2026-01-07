package com.ehr.staffservice.mapper.patientaccess;

import com.ehr.staffservice.dto.patientaccess.CoverageDto;
import com.ehr.staffservice.entity.patientaccess.Coverage;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CoverageMapper {
    CoverageDto toDto(Coverage coverage);
    Coverage toEntity(CoverageDto dto);
}

