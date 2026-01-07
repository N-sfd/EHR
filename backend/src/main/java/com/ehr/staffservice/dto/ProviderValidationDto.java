package com.ehr.staffservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for provider validation required by Patient-Service.
 * Used for encounter creation, medication ordering, note signing, vitals ordering,
 * and radiology/lab provider assignment.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProviderValidationDto {
    private Long providerId;
    private Long role;
    private boolean active;
    private boolean validLicense;
}
