package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.StaffLicenseDto;
import com.ehr.staffservice.entity.StaffLicense;
import com.ehr.staffservice.mapper.StaffLicenseMapper;
import com.ehr.staffservice.repository.StaffLicenseRepository;
import com.ehr.staffservice.service.StaffLicenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffLicenseServiceImpl implements StaffLicenseService {

    private final StaffLicenseRepository repo;
    private final StaffLicenseMapper mapper;

    @Override
    public StaffLicenseDto add(StaffLicenseDto dto) {
        StaffLicense entity = repo.save(mapper.toEntity(dto));
        return mapper.toDto(entity);
    }

    @Override
    public List<StaffLicenseDto> getByStaff(UUID staffId) {
        return repo.findByStaffId(staffId).stream().map(mapper::toDto).toList();
    }
}
