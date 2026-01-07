package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.WorkListTaskDto;
import com.ehr.staffservice.entity.WorkListTask;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface WorkListTaskMapper {
    WorkListTaskDto toDto(WorkListTask entity);
    
    @Mapping(target = "taskId", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    WorkListTask toEntity(WorkListTaskDto dto);
    
    @Mapping(target = "taskId", ignore = true)
    @Mapping(target = "completedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(WorkListTaskDto dto, @MappingTarget WorkListTask entity);
}

