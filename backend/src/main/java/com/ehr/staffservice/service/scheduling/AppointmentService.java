package com.ehr.staffservice.service.scheduling;

import com.ehr.staffservice.dto.scheduling.AppointmentRequestDto;
import com.ehr.staffservice.dto.scheduling.AppointmentResponseDto;
import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {
    List<AppointmentResponseDto> getAppointmentsByDate(LocalDate date);
    List<AppointmentResponseDto> getAppointmentsByDateAndProvider(LocalDate date, Long providerId);
    AppointmentResponseDto createAppointment(AppointmentRequestDto dto);
    AppointmentResponseDto cancelAppointment(Long id, String reason);
    AppointmentResponseDto updateAppointmentStatus(Long id, String status);
}

