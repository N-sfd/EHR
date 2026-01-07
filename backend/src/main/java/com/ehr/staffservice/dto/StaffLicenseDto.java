package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.sql.Date;

@Data
public class StaffLicenseDto {

    private UUID licenseId;

    @NotNull
    private UUID staffId;

    private String licenseNumber;
    private String licenseType;
    private String issuedBy;

    private Date expiryDate;
}
