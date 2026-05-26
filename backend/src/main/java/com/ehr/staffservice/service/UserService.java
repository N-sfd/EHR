package com.ehr.staffservice.service;

import com.ehr.staffservice.entity.User;
import com.ehr.staffservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

/**
 * User service for authentication.
 * In development, uses in-memory users. In production, use database.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Authenticate user by username and password.
     */
    public Optional<User> authenticate(String username, String password) {
        log.debug("Attempting to authenticate user: {}", username);
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isEmpty()) {
            log.warn("User not found: {}", username);
            return Optional.empty();
        }
        
        User user = userOpt.get();
        log.debug("User found: {} (active: {}, role: {})", username, user.getActive(), user.getRole());
        
        if (!user.getActive()) {
            log.warn("User is inactive: {}", username);
            return Optional.empty();
        }
        
        boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());
        log.debug("Password match for user {}: {}", username, passwordMatches);
        
        if (passwordMatches) {
            log.info("Authentication successful for user: {}", username);
            return Optional.of(user);
        }
        
        log.warn("Password mismatch for user: {}", username);
        return Optional.empty();
    }

    /**
     * Find user by username.
     */
    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    /**
     * Find user by ID.
     */
    public Optional<User> findById(Long userId) {
        if (userId == null) {
            return Optional.empty();
        }
        return userRepository.findById(userId);
    }
}

