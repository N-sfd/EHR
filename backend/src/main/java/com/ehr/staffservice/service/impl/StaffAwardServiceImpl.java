package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.StaffAwardDto;
import com.ehr.staffservice.mapper.StaffAwardMapper;
import com.ehr.staffservice.repository.StaffAwardRepository;
import com.ehr.staffservice.service.StaffAwardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StaffAwardServiceImpl implements StaffAwardService {

    private final StaffAwardRepository repo;
    private final StaffAwardMapper mapper;

    @Override
    public StaffAwardDto add(StaffAwardDto dto) {
        return mapper.toDto(repo.save(mapper.toEntity(dto)));
    }

    @Override
    public List<StaffAwardDto> getByStaff(UUID staffId) {
        return repo.findByStaffId(staffId).stream().map(mapper::toDto).toList();
    }
}
