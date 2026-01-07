package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.ScheduleTemplateDto;
import com.ehr.staffservice.entity.scheduling.ScheduleTemplate;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.scheduling.ScheduleTemplateMapper;
import com.ehr.staffservice.repository.scheduling.ScheduleTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleTemplateServiceImpl implements ScheduleTemplateService {
    private final ScheduleTemplateRepository templateRepository;
    private final ScheduleTemplateMapper templateMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleTemplateDto> getTemplatesByProviderId(Long providerId) {
        List<ScheduleTemplate> templates = templateRepository.findByProviderIdAndIsActiveTrue(providerId);
        return templates.stream()
                .map(templateMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScheduleTemplateDto createTemplate(ScheduleTemplateDto dto) {
        ScheduleTemplate template = templateMapper.toEntity(dto);
        
        // Set day of week enum
        if (dto.getDayOfWeek() != null) {
            template.setDayOfWeek(ScheduleTemplate.DayOfWeek.valueOf(dto.getDayOfWeek()));
        }
        
        ScheduleTemplate saved = templateRepository.save(template);
        return templateMapper.toDto(saved);
    }

    @Override
    @Transactional
    public ScheduleTemplateDto updateTemplate(Long id, ScheduleTemplateDto dto) {
        ScheduleTemplate template = templateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule template not found with id: " + id));
        
        if (dto.getDayOfWeek() != null) {
            template.setDayOfWeek(ScheduleTemplate.DayOfWeek.valueOf(dto.getDayOfWeek()));
        }
        template.setStartTime(dto.getStartTime());
        template.setEndTime(dto.getEndTime());
        template.setSlotDuration(dto.getSlotDuration());
        template.setOverbookAllowed(dto.getOverbookAllowed());
        template.setIsActive(dto.getIsActive());
        
        ScheduleTemplate saved = templateRepository.save(template);
        return templateMapper.toDto(saved);
    }
}

