package com.ehr.staffservice.dto;

import lombok.Data;

@Data
public class ParticipantDto {
    private Long participantIdRef;
    private String participantType;
    private String participantName; // Computed: patient name or provider name
}

