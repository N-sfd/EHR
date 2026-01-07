package com.ehr.staffservice.mapper.patientaccess;

import com.ehr.staffservice.dto.patientaccess.PatientDto;
import com.ehr.staffservice.entity.patientaccess.Patient;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, 
        implementationName = "PatientAccessPatientMapperImpl")
public interface PatientMapper {
    PatientDto toDto(Patient patient);
    Patient toEntity(PatientDto dto);
}

