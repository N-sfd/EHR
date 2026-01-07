package com.ehr.staffservice.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import com.ehr.staffservice.dto.StaffAwardDto;
import com.ehr.staffservice.entity.StaffAward;

@Mapper(componentModel = "spring")
public interface StaffAwardMapper {
    StaffAwardDto toDto(StaffAward entity);
    
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    StaffAward toEntity(StaffAwardDto dto);
}
