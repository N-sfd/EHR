package com.ehr.staffservice.service.impl;

import com.ehr.staffservice.dto.ScheduleGridDto;
import com.ehr.staffservice.entity.Appointment;
import com.ehr.staffservice.entity.ProviderSchedule;
import com.ehr.staffservice.repository.AppointmentRepository;
import com.ehr.staffservice.repository.ProviderScheduleRepository;
import com.ehr.staffservice.service.ScheduleGridService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleGridServiceImpl implements ScheduleGridService {

    private final ProviderScheduleRepository scheduleRepository;
    private final AppointmentRepository appointmentRepository;

    @Override
    public ScheduleGridDto getProviderScheduleGrid(Long providerId, LocalDate date) {
        List<ProviderSchedule> schedules = scheduleRepository.findByProviderIdAndScheduleDate(providerId, date);
        List<Appointment> appointments = appointmentRepository.findByDoctorIdAndAppointmentDate(providerId, date);
        
        return buildScheduleGrid(providerId, date, schedules, appointments);
    }

    @Override
    public List<ScheduleGridDto> getProviderScheduleGridRange(Long providerId, LocalDate startDate, LocalDate endDate) {
        List<ProviderSchedule> schedules = scheduleRepository.findAvailableSchedulesByProviderAndDateRange(providerId, startDate, endDate);
        List<Appointment> appointments = appointmentRepository.findByDoctorAndDateRange(providerId, startDate, endDate);
        
        Map<LocalDate, List<ProviderSchedule>> schedulesByDate = schedules.stream()
                .collect(Collectors.groupingBy(ProviderSchedule::getScheduleDate));
        Map<LocalDate, List<Appointment>> appointmentsByDate = appointments.stream()
                .collect(Collectors.groupingBy(Appointment::getAppointmentDate));
        
        List<ScheduleGridDto> grids = new ArrayList<>();
        LocalDate currentDate = startDate;
        while (!currentDate.isAfter(endDate)) {
            List<ProviderSchedule> daySchedules = schedulesByDate.getOrDefault(currentDate, new ArrayList<>());
            List<Appointment> dayAppointments = appointmentsByDate.getOrDefault(currentDate, new ArrayList<>());
            grids.add(buildScheduleGrid(providerId, currentDate, daySchedules, dayAppointments));
            currentDate = currentDate.plusDays(1);
        }
        
        return grids;
    }

    @Override
    public List<ScheduleGridDto> getMultiProviderScheduleGrid(List<Long> providerIds, LocalDate date) {
        List<ScheduleGridDto> grids = new ArrayList<>();
        for (Long providerId : providerIds) {
            grids.add(getProviderScheduleGrid(providerId, date));
        }
        return grids;
    }

    private ScheduleGridDto buildScheduleGrid(Long providerId, LocalDate date, 
                                             List<ProviderSchedule> schedules, 
                                             List<Appointment> appointments) {
        ScheduleGridDto grid = new ScheduleGridDto();
        grid.setProviderId(providerId);
        grid.setScheduleDate(date);
        
        if (!schedules.isEmpty()) {
            ProviderSchedule firstSchedule = schedules.get(0);
            grid.setStartTime(firstSchedule.getStartTime());
            grid.setEndTime(firstSchedule.getEndTime());
            grid.setSlotIntervalMinutes(firstSchedule.getSlotIntervalMinutes());
            grid.setLocation(firstSchedule.getLocation());
        } else {
            // Default schedule
            grid.setStartTime(LocalTime.of(8, 0));
            grid.setEndTime(LocalTime.of(17, 0));
            grid.setSlotIntervalMinutes(15);
        }
        
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
        Map<LocalTime, Appointment> appointmentMap = appointments.stream()
                .collect(Collectors.toMap(
                        Appointment::getAppointmentTime,
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
                aptSlot.setAppointmentId(appointment.getAppointmentId());
                aptSlot.setAppointmentCode(appointment.getAppointmentCode());
                aptSlot.setPatientId(appointment.getPatientId());
                aptSlot.setVisitType(appointment.getVisitType());
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

