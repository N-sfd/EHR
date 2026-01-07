package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.ProviderEncounterDto;
import java.util.Optional;

public interface ProviderEncounterService {
    ProviderEncounterDto create(ProviderEncounterDto dto);
    ProviderEncounterDto update(Long id, ProviderEncounterDto dto);
    ProviderEncounterDto get(Long id);
    Optional<ProviderEncounterDto> getByEncounterId(Long encounterId);
    ProviderEncounterDto sign(Long id, Long staffId);
    ProviderEncounterDto complete(Long id);
}

