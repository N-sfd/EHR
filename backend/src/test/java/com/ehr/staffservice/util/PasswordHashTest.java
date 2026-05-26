package com.ehr.staffservice.util;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Test to generate BCrypt hash for "password"
 * Run with: mvn test -Dtest=PasswordHashTest
 */
public class PasswordHashTest {
    
    @Test
    public void generatePasswordHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "password";
        String hash = encoder.encode(password);
        
        System.out.println("========================================");
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("Hash Length: " + hash.length());
        System.out.println("========================================");
        
        // Verify the hash works
        boolean matches = encoder.matches(password, hash);
        System.out.println("Verification: " + (matches ? "SUCCESS" : "FAILED"));
        
        // Test with the old hash from database
        String oldHash = "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
        boolean oldMatches = encoder.matches(password, oldHash);
        System.out.println("Old hash verification: " + (oldMatches ? "SUCCESS" : "FAILED"));
        
        // Test with the new verified hash
        String newHash = "$2a$10$Eis4hN7KoJxmZSKCOCjwDOCQAuQ0L7gXPy2Zz4fnsUHXutilM4KYG";
        boolean newMatches = encoder.matches(password, newHash);
        System.out.println("New hash verification: " + (newMatches ? "SUCCESS" : "FAILED"));
        
        System.out.println("\nSQL UPDATE statement:");
        System.out.println("UPDATE users SET password = '" + hash + "' WHERE username = 'patient1';");
    }
}

