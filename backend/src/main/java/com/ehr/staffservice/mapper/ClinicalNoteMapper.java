package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.ClinicalNoteDto;
import com.ehr.staffservice.entity.ClinicalNote;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ClinicalNoteMapper {
    ClinicalNoteDto toDto(ClinicalNote entity);
    
    @Mapping(target = "noteId", ignore = true)
    @Mapping(target = "isSigned", ignore = true)
    @Mapping(target = "signedDateTime", ignore = true)
    @Mapping(target = "cosignedByStaffId", ignore = true)
    @Mapping(target = "cosignedDateTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    ClinicalNote toEntity(ClinicalNoteDto dto);
    
    @Mapping(target = "noteId", ignore = true)
    @Mapping(target = "isSigned", ignore = true)
    @Mapping(target = "signedDateTime", ignore = true)
    @Mapping(target = "cosignedByStaffId", ignore = true)
    @Mapping(target = "cosignedDateTime", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ClinicalNoteDto dto, @MappingTarget ClinicalNote entity);
}

