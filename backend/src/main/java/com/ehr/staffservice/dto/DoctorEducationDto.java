package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DoctorEducationDto {
    private Long id;
    private Long doctorId;
    private String degree;
    private String university;
    private LocalDate startDate;
    private LocalDate endDate;
}

