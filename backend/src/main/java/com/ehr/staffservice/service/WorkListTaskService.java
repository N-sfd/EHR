package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.WorkListTaskDto;
import java.util.List;

public interface WorkListTaskService {
    WorkListTaskDto create(WorkListTaskDto dto);
    WorkListTaskDto update(Long id, WorkListTaskDto dto);
    WorkListTaskDto get(Long id);
    void delete(Long id);
    List<WorkListTaskDto> getAll();
    List<WorkListTaskDto> getByStaffId(Long staffId);
    List<WorkListTaskDto> getByStaffIdAndStatus(Long staffId, String status);
    List<WorkListTaskDto> getByPatientId(Long patientId);
    WorkListTaskDto completeTask(Long id);
}

