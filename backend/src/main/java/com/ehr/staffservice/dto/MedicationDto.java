package com.ehr.staffservice.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class MedicationDto {
    private Long medicationId;
    private Long patientId;
    private String medicationName;
    private String commonName;
    private String dosage;
    private String frequency;
    private String instructions;
    private LocalDate prescribedDate;
    private Long prescriberId;
    private String prescriberName;
    private String prescriptionNumber;
    private String quantity;
    private Integer daySupply;
    private String pharmacyName;
    private String pharmacyAddress;
    private String pharmacyCity;
    private String pharmacyState;
    private String pharmacyZip;
    private String pharmacyPhone;
    private Integer refillsRemaining;
    private Boolean isActive;
    private Boolean isExternal;
}
