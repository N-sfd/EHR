package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.sql.Date;

@Data
public class StaffEducationDto {

    private UUID eduId;

    @NotNull
    private UUID staffId;

    @NotBlank
    private String degree;

    @NotBlank
    private String university;

    private Date startDate;
    private Date endDate;
}
