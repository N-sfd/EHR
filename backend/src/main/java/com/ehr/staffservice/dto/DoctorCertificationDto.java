package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DoctorCertificationDto {
    private Long id;
    private Long doctorId;
    private String name;
    private String issuedBy;
    private LocalDate issueDate;
    private LocalDate expiryDate;
}

