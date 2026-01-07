package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.RoleDto;
import com.ehr.staffservice.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    @Mapping(target = "roleId", source = "roleId")
    RoleDto toDto(Role entity);
    
    @Mapping(target = "roleId", source = "roleId")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Role toEntity(RoleDto dto);
    
    @Mapping(target = "roleId", source = "roleId")
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(RoleDto dto, @MappingTarget Role entity);
}

