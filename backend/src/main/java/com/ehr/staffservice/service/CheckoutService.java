package com.ehr.staffservice.service;

import com.ehr.staffservice.dto.CheckoutDto;
import java.util.Optional;

public interface CheckoutService {
    CheckoutDto create(CheckoutDto dto);
    CheckoutDto update(Long id, CheckoutDto dto);
    CheckoutDto get(Long id);
    Optional<CheckoutDto> getByEncounterId(Long encounterId);
    CheckoutDto complete(Long id);
}

