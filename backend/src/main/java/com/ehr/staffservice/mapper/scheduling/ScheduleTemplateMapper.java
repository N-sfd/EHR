package com.ehr.staffservice.mapper.scheduling;

import com.ehr.staffservice.dto.scheduling.ScheduleTemplateDto;
import com.ehr.staffservice.entity.scheduling.ScheduleTemplate;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ScheduleTemplateMapper {
    ScheduleTemplateDto toDto(ScheduleTemplate template);
    ScheduleTemplate toEntity(ScheduleTemplateDto dto);
}

