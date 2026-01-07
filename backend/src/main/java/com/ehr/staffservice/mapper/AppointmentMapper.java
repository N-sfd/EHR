package com.ehr.staffservice.mapper;

import com.ehr.staffservice.dto.AppointmentDto;
import com.ehr.staffservice.entity.Appointment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface AppointmentMapper {

    @Mapping(target = "patientName", ignore = true)
    @Mapping(target = "patientPhone", ignore = true)
    @Mapping(target = "doctorName", ignore = true)
    @Mapping(target = "departmentName", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    AppointmentDto toDto(Appointment entity);

    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Appointment toEntity(AppointmentDto dto);

    @Mapping(target = "appointmentId", ignore = true)
    @Mapping(target = "doctor", ignore = true)
    @Mapping(target = "department", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(AppointmentDto dto, @MappingTarget Appointment entity);
}

