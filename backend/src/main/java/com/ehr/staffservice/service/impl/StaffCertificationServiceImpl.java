package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.StaffCertificationDto;
import com.ehr.staffservice.mapper.StaffCertificationMapper;
import com.ehr.staffservice.repository.StaffCertificationRepository;
import com.ehr.staffservice.service.StaffCertificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffCertificationServiceImpl implements StaffCertificationService {

    private final StaffCertificationRepository repo;
    private final StaffCertificationMapper mapper;

    @Override
    public StaffCertificationDto add(StaffCertificationDto dto) {
        return mapper.toDto(repo.save(mapper.toEntity(dto)));
    }

    @Override
    public List<StaffCertificationDto> getByStaff(UUID staffId) {
        return repo.findByStaffId(staffId).stream().map(mapper::toDto).toList();
    }
}
