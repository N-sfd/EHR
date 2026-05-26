package com.ehr.staffservice.dto;

import lombok.Data;

@Data
public class LabResultItemDto {
    private Long itemId;
    private String testName;
    private String value;
    private String units;
    private String referenceRange;
    private String flag; // "L", "H", "CRITICAL", or null
    private Boolean abnormal;
}

