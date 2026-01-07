package com.ehr.shared.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Shared DTO used by Patient and Staff services to perform provider validation.
 * Keep this class in sync between services or use this shared module as a dependency.
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
