package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import com.ehr.staffservice.dto.PermissionDto;
import com.ehr.staffservice.entity.Permission;

@Mapper(componentModel = "spring")
public interface PermissionMapper {
    PermissionDto toDto(Permission entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Permission toEntity(PermissionDto dto);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(PermissionDto dto, @MappingTarget Permission entity);
}

