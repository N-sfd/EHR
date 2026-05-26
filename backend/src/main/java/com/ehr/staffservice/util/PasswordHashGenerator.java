package com.ehr.staffservice.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility to generate BCrypt password hashes.
 * Run with: mvn exec:java -Dexec.mainClass="com.ehr.staffservice.util.PasswordHashGenerator" -Dexec.args="password"
 */
public class PasswordHashGenerator {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.out.println("Usage: PasswordHashGenerator <password>");
            System.out.println("Example: PasswordHashGenerator password");
            return;
        }
        
        String password = args[0];
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("BCrypt Hash: " + hash);
        System.out.println("\nSQL UPDATE statement:");
        System.out.println("UPDATE users SET password = '" + hash + "' WHERE username = 'patient1';");
    }
}

