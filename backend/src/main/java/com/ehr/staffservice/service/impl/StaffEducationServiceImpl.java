package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.StaffEducationDto;
import com.ehr.staffservice.mapper.StaffEducationMapper;
import com.ehr.staffservice.repository.StaffEducationRepository;
import com.ehr.staffservice.service.StaffEducationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffEducationServiceImpl implements StaffEducationService {

    private final StaffEducationRepository repo;
    private final StaffEducationMapper mapper;

    @Override
    public StaffEducationDto add(StaffEducationDto dto) {
        return mapper.toDto(repo.save(mapper.toEntity(dto)));
    }

    @Override
    public List<StaffEducationDto> getByStaff(UUID staffId) {
        return repo.findByStaffId(staffId).stream().map(mapper::toDto).toList();
    }
}
