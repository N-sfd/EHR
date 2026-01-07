package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.ProviderDto;
import com.ehr.staffservice.entity.scheduling.Provider;
import com.ehr.staffservice.exception.ResourceNotFoundException;
import com.ehr.staffservice.mapper.scheduling.ProviderMapper;
import com.ehr.staffservice.repository.scheduling.ProviderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProviderServiceImpl implements ProviderService {
    private final ProviderRepository providerRepository;
    private final ProviderMapper providerMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProviderDto> getAllProviders() {
        return providerRepository.findAll().stream()
                .map(providerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProviderDto> getActiveProviders() {
        return providerRepository.findByIsActiveTrue().stream()
                .map(providerMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ProviderDto getProviderById(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Provider not found with id: " + id));
        return providerMapper.toDto(provider);
    }

    @Override
    @Transactional
    public ProviderDto createProvider(ProviderDto dto) {
        Provider provider = providerMapper.toEntity(dto);
        Provider saved = providerRepository.save(provider);
        return providerMapper.toDto(saved);
    }
}

