package com.ehr.staffservice.dto;

import lombok.Data;
import java.util.List;

@Data
public class StaffWithAppointmentsDto {
    private StaffDto staff;
    private List<AppointmentDto> appointments;
}