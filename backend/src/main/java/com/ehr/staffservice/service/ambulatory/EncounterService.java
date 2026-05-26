package com.ehr.staffservice.service.ambulatory;

import com.ehr.staffservice.dto.ambulatory.EncounterDto;
import java.util.List;
import java.util.Optional;

public interface EncounterService {
    EncounterDto createEncounterFromAppointment(Long appointmentId);
    EncounterDto getEncounterById(Long id);
    List<EncounterDto> getEncountersByPatientId(Long patientId);
    EncounterDto updateEncounter(Long id, EncounterDto dto);
    List<EncounterDto> getAllEncounters();
    EncounterDto updateEncounterStatus(Long id, String status);
    Optional<EncounterDto> getEncounterByAppointmentId(Long appointmentId);
}

