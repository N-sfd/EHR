package com.ehr.staffservice.repository.scheduling;

import com.ehr.staffservice.entity.scheduling.ScheduleTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleTemplateRepository extends JpaRepository<ScheduleTemplate, Long> {
    List<ScheduleTemplate> findByProviderId(Long providerId);
    List<ScheduleTemplate> findByProviderIdAndIsActiveTrue(Long providerId);
}

