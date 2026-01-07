package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.CarePlanDto;
import java.util.List;

public interface CarePlanService {
    CarePlanDto create(CarePlanDto dto);
    CarePlanDto update(Long id, CarePlanDto dto);
    CarePlanDto get(Long id);
    void delete(Long id);
    List<CarePlanDto> getByPatientId(Long patientId);
    List<CarePlanDto> getByPatientIdAndStatus(Long patientId, String status);
    CarePlanDto resolve(Long id);
}

