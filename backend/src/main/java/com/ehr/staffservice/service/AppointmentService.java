package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.*;
import com.ehr.staffservice.dto.reports.ProviderUtilizationDto;
import com.ehr.staffservice.dto.reports.SchedulingSummaryDto;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Appointment Service Interface
 * Uses TIMESTAMP-based operations (no string times)
 * Single AppointmentDto used for all operations
 */
public interface AppointmentService {
    
    // ScheduleGrid operations
    List<AppointmentDto> queryAppointments(
            LocalDateTime start, 
            LocalDateTime end, 
            List<Long> doctorIds,
            List<Long> departmentIds,
            List<String> statuses,
            List<Long> roomIds);
    
    AppointmentDto moveAppointment(Long id, AppointmentMoveRequest request);
    AppointmentDto resizeAppointment(Long id, AppointmentResizeRequest request);
    AppointmentDto updateAppointmentStatus(Long appointmentId, String status, String reason);
    
    // Scheduler operations
    AppointmentDto createAppointment(AppointmentDto request);
    AppointmentDto updateAppointment(Long id, AppointmentDto request);
    AppointmentDto getAppointment(Long id);
    
    // Additional query methods
    List<AppointmentDto> getByPatient(Long patientId);
    List<AppointmentDto> getByDoctor(Long doctorId);
    
    // Reporting methods
    SchedulingSummaryDto getSchedulingSummary(
            LocalDateTime start,
            LocalDateTime end,
            List<Long> doctorIds);
    
    List<ProviderUtilizationDto> getProviderUtilization(
            LocalDateTime start,
            LocalDateTime end,
            List<Long> doctorIds);
}

