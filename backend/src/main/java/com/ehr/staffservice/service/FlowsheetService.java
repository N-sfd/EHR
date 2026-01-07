package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.FlowsheetDto;
import java.time.LocalDateTime;
import java.util.List;

public interface FlowsheetService {
    FlowsheetDto create(FlowsheetDto dto);
    FlowsheetDto update(Long id, FlowsheetDto dto);
    FlowsheetDto get(Long id);
    void delete(Long id);
    List<FlowsheetDto> getByPatientId(Long patientId);
    List<FlowsheetDto> getByPatientIdAndFlowsheetType(Long patientId, String flowsheetType);
    List<FlowsheetDto> getByPatientIdAndDateRange(Long patientId, LocalDateTime startDate, LocalDateTime endDate);
}

