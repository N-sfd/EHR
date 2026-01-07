package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.AppointmentDto;
import com.ehr.staffservice.dto.CalendarViewDto;
import com.ehr.staffservice.dto.TimeSlotDto;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface AppointmentService {
    AppointmentDto create(AppointmentDto dto);
    AppointmentDto update(Long id, AppointmentDto dto);
    AppointmentDto get(Long id);
    AppointmentDto getByCode(String code);
    List<AppointmentDto> getAll();
    List<AppointmentDto> getByDoctor(Long doctorId);
    List<AppointmentDto> getByPatient(Long patientId);
    List<AppointmentDto> getByDepartment(Long departmentId);
    List<AppointmentDto> getByDateRange(String startDate, String endDate);
    void delete(Long id);
    
    // Calendar view methods
    CalendarViewDto getWeekView(LocalDate weekStart, Long doctorId);
    CalendarViewDto getMonthView(LocalDate monthStart, Long doctorId);
    CalendarViewDto getDayView(LocalDate date, Long doctorId);
    List<TimeSlotDto> getAvailableTimeSlots(LocalDate date, Long doctorId, Integer slotDurationMinutes);
    Boolean isTimeSlotAvailable(LocalDate date, LocalTime startTime, LocalTime endTime, Long doctorId);
}

