package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.ProviderDto;
import java.util.List;

public interface ProviderService {
    List<ProviderDto> getAllProviders();
    List<ProviderDto> getActiveProviders();
    ProviderDto getProviderById(Long id);
    ProviderDto createProvider(ProviderDto dto);
}

