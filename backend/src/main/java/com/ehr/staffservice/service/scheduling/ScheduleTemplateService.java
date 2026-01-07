package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.ScheduleTemplateDto;
import java.util.List;

public interface ScheduleTemplateService {
    List<ScheduleTemplateDto> getTemplatesByProviderId(Long providerId);
    ScheduleTemplateDto createTemplate(ScheduleTemplateDto dto);
    ScheduleTemplateDto updateTemplate(Long id, ScheduleTemplateDto dto);
}

