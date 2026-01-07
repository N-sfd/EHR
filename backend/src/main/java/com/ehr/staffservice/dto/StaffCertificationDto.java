package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.sql.Date;

@Data
public class StaffCertificationDto {

    private UUID certId;

    @NotNull
    private UUID staffId;

    @NotBlank
    private String name;

    private String issuedBy;

    private Date issueDate;
}
