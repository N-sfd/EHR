package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.ImagingStudyDto;
import com.ehr.staffservice.entity.ImagingStudy;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ImagingStudyMapper {
    ImagingStudyDto toDto(ImagingStudy entity);
    
    @Mapping(target = "imagingStudyId", ignore = true)
    @Mapping(target = "studyNumber", ignore = true)
    @Mapping(target = "completedDateTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ImagingStudy toEntity(ImagingStudyDto dto);
    
    @Mapping(target = "imagingStudyId", ignore = true)
    @Mapping(target = "studyNumber", ignore = true)
    @Mapping(target = "completedDateTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ImagingStudyDto dto, @MappingTarget ImagingStudy entity);
}

