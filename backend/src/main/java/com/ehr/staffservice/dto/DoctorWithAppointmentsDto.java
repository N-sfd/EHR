package com.ehr.staffservice.dto;

import lombok.Data;
import java.util.List;

@Data

public class DoctorWithAppointmentsDto {
    private DoctorDto doctor;                // or StaffDto if you don’t have DoctorDto yet
    private List<AppointmentDto> appointments;

}