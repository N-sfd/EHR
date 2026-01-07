package com.ehr.staffservice.dto;

import lombok.Data;
import jakarta.validation.constraints.*;
import java.util.UUID;
import java.sql.Date;

@Data
public class StaffAwardDto {

    private UUID awardId;

    @NotNull
    private UUID staffId;

    @NotBlank
    private String name;

    private String awardedBy;

    private Date awardDate;
}
