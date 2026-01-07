package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class DoctorLicenseDto {
    private Long id;
    private Long doctorId;
    private String licenseNumber;
    private String licenseType;
    private String issuedBy;
    private LocalDate issueDate;
    private LocalDate expiryDate;
}

