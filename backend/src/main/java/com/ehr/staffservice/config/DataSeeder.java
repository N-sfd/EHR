package com.ehr.staffservice.config;

import com.ehr.staffservice.entity.User;
import com.ehr.staffservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds the baseline login accounts on startup so the app is usable on a fresh database.
 * Idempotent: only creates a user if the username does not already exist.
 *
 * Default credentials (change in production): admin / provider1 / patient1, all password "password".
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        seedUser("admin", "ADMIN", null, null);
        seedUser("provider1", "PROVIDER", null, null);
        seedUser("patient1", "PATIENT", null, null);
    }

    private void seedUser(String username, String role, Long patientId, Long staffId) {
        if (userRepository.findByUsername(username).isPresent()) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode("password"));
        user.setRole(role);
        user.setPatientId(patientId);
        user.setStaffId(staffId);
        user.setActive(true);
        userRepository.save(user);
        log.info("Seeded default user '{}' with role {}", username, role);
    }
}
