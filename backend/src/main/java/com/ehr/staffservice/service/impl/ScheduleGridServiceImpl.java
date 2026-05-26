package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ScheduleGridDto;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.service.ScheduleGridService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleGridServiceImpl implements ScheduleGridService {

    private final AppointmentRepository appointmentRepository;

    @Override
    public ScheduleGridDto getDoctorScheduleGrid(Long doctorId, LocalDate date) {
        // Use default schedule (8am-5pm, 15min slots) - provider_availability can be used for custom schedules
        LocalDateTime startDateTime = date.atStartOfDay();
        LocalDateTime endDateTime = date.plusDays(1).atStartOfDay();
        List<Appointment> appointments = appointmentRepository.findByDateRange(
                startDateTime, endDateTime, List.of(doctorId), null);
        
        return buildScheduleGrid(doctorId, date, appointments);
    }

    @Override
    public List<ScheduleGridDto> getDoctorScheduleGridRange(Long doctorId, LocalDate startDate, LocalDate endDate) {
        // Use default schedule (8am-5pm, 15min slots) - provider_availability can be used for custom schedules
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.plusDays(1).atStartOfDay();
        List<Appointment> appointments = appointmentRepository.findByDateRange(
                startDateTime, endDateTime, List.of(doctorId), null);
        
        Map<LocalDate, List<Appointment>> appointmentsByDate = appointments.stream()
                .collect(Collectors.groupingBy(apt -> apt.getStartAt().toLocalDate()));
        
        List<ScheduleGridDto> grids = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<Appointment> dayAppointments = appointmentsByDate.getOrDefault(currentDate, new ArrayList<>());
            grids.add(buildScheduleGrid(doctorId, currentDate, dayAppointments));
            currentDate = currentDate.plusDays(1);
        }
        
        return grids;
    }

    @Override
    public List<ScheduleGridDto> getMultiDoctorScheduleGrid(List<Long> doctorIds, LocalDate date) {
        List<ScheduleGridDto> grids = new ArrayList<>();
        for (Long doctorId : doctorIds) {
            grids.add(getDoctorScheduleGrid(doctorId, date));
        }
        return grids;
    }

    private ScheduleGridDto buildScheduleGrid(Long doctorId, LocalDate date, 
                                             List<Appointment> appointments) {
        ScheduleGridDto grid = new ScheduleGridDto();
        grid.setDoctorId(doctorId);
        grid.setScheduleDate(date);
        
        // Default schedule (8am-5pm, 15min slots)
        // Custom schedules can be managed via provider_availability table
            grid.setStartTime(LocalTime.of(8, 0));
            grid.setEndTime(LocalTime.of(17, 0));
            grid.setSlotIntervalMinutes(15);
        grid.setLocation(null);
        
        // Build time slots
        List<ScheduleGridDto.TimeSlotDto> timeSlots = generateTimeSlots(
                grid.getStartTime(), 
                grid.getEndTime(), 
                grid.getSlotIntervalMinutes(),
                appointments
        );
        grid.setTimeSlots(timeSlots);
        
        return grid;
    }

    private List<ScheduleGridDto.TimeSlotDto> generateTimeSlots(LocalTime startTime, LocalTime endTime, 
                                                                 Integer intervalMinutes, 
                                                                 List<Appointment> appointments) {
        List<ScheduleGridDto.TimeSlotDto> slots = new ArrayList<>();
        // Map appointments by their start time (rounded to nearest slot)
        Map<LocalTime, Appointment> appointmentMap = appointments.stream()
                .collect(Collectors.toMap(
                        apt -> apt.getStartAt().toLocalTime().withSecond(0).withNano(0),
                        apt -> apt,
                        (existing, replacement) -> existing
                ));
        
        LocalTime current = startTime;
        while (current.isBefore(endTime)) {
            ScheduleGridDto.TimeSlotDto slot = new ScheduleGridDto.TimeSlotDto();
            slot.setStartTime(current);
            slot.setEndTime(current.plusMinutes(intervalMinutes));
            
            Appointment appointment = appointmentMap.get(current);
            if (appointment != null) {
                slot.setStatus("BOOKED");
                slot.setColorCode("red");
                slot.setIsSelectable(false);
                
                ScheduleGridDto.AppointmentSlotDto aptSlot = new ScheduleGridDto.AppointmentSlotDto();
                aptSlot.setAppointmentId(appointment.getId());
                aptSlot.setAppointmentCode("APT" + appointment.getId()); // Generate code from ID
                aptSlot.setPatientId(appointment.getPatientId());
                aptSlot.setVisitType(appointment.getVisitType()); // Visit type from Appointment entity
                aptSlot.setDurationMinutes(appointment.getDurationMinutes());
                aptSlot.setStatus(appointment.getStatus());
                slot.setAppointment(aptSlot);
            } else {
                slot.setStatus("AVAILABLE");
                slot.setColorCode("blue");
                slot.setIsSelectable(true);
            }
            
            slots.add(slot);
            current = current.plusMinutes(intervalMinutes);
        }
        
        return slots;
    }
}

