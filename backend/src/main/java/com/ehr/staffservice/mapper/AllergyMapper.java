package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.AllergyDto;
import com.ehr.staffservice.entity.Allergy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AllergyMapper {
    AllergyDto toDto(Allergy entity);
    
    @Mapping(target = "allergyId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Allergy toEntity(AllergyDto dto);
    
    @Mapping(target = "allergyId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(AllergyDto dto, @MappingTarget Allergy entity);
}

