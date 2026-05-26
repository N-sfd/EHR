package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long userId;

    @Column(unique = true, nullable = false, length = 100)
    private String username;

    @Column(nullable = false, length = 255)
    private String password; // BCrypt hashed

    @Column(nullable = false, length = 50)
    private String role; // ADMIN, PATIENT, PROVIDER

    @Column(name = "patient_id")
    private Long patientId; // Optional: link to patient

    @Column(name = "staff_id")
    private Long staffId; // Optional: link to staff

    @Column(nullable = false)
    private Boolean active = true;
}

