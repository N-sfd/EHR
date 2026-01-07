package com.ehr.staffservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
public class ImmunizationDto {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long id;

    @NotNull(message = "Patient ID is required")
    private Long patientId;

    @NotBlank(message = "Vaccine name is required")
    private String vaccineName;

    private String cvxCode;
    private String ndcCode;
    private String manufacturer;
    private String lotNumber;

    @NotNull(message = "Administration date is required")
    private LocalDate administrationDate;

    private LocalDate expirationDate;
    private Long administeredByStaffId;
    private String route;
    private String site;
    private String dose;
    private String doseUnit;
    private Integer seriesNumber;
    private String informationSource;

    @NotBlank(message = "Status is required")
    private String status; // COMPLETED, REFUSED, NOT_GIVEN, PARTIALLY_ADMINISTERED

    private LocalDate visDate;
    private String visVersion;
    private String notes;
    private String reaction;
}

