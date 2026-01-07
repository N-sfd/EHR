package com.ehr.staffservice.mapper.scheduling;

import com.ehr.staffservice.dto.scheduling.DepartmentDto;
import com.ehr.staffservice.entity.scheduling.Department;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING,
        implementationName = "SchedulingDepartmentMapperImpl")
public interface DepartmentMapper {
    DepartmentDto toDto(Department department);
    Department toEntity(DepartmentDto dto);
}

