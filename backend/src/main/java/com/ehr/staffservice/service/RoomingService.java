package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.RoomingDto;
import java.util.Optional;

public interface RoomingService {
    RoomingDto create(RoomingDto dto);
    RoomingDto update(Long id, RoomingDto dto);
    RoomingDto get(Long id);
    Optional<RoomingDto> getByEncounterId(Long encounterId);
    Optional<RoomingDto> getByAppointmentId(Long appointmentId);
    RoomingDto complete(Long id);
}

