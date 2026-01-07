package com.ehr.staffservice.repository;

import com.ehr.staffservice.entity.ClinicSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ClinicSettingsRepository extends JpaRepository<ClinicSettings, Long> {
    // Since there should only be one clinic settings record
    Optional<ClinicSettings> findFirstByOrderByIdAsc();
}

