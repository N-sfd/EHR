package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.EncounterDto;
import java.time.LocalDateTime;
import java.util.List;

public interface EncounterService {
    EncounterDto create(EncounterDto dto);
    EncounterDto update(Long id, EncounterDto dto);
    EncounterDto get(Long id);
    EncounterDto getByEncounterNumber(String encounterNumber);
    void delete(Long id);
    List<EncounterDto> getByPatientId(Long patientId);
    List<EncounterDto> getByPatientIdAndStatus(Long patientId, String status);
    List<EncounterDto> getByAppointmentId(Long appointmentId);
    EncounterDto checkIn(Long encounterId, Long staffId);
    EncounterDto checkOut(Long encounterId, Long staffId);
    EncounterDto completeRegistration(Long encounterId, Long staffId);
}

