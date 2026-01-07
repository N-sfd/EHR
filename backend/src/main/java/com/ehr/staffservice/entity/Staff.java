package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;

@Entity
@Table(name = "staff")
@Data
@EqualsAndHashCode(callSuper = false)
public class Staff extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long staffId;

    @Column(name = "staff_code", unique = true, length = 20)
    private String staffCode;

    // Common fields shared with Doctor
    @Column(nullable = false, length = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    private String lastName;

    @Column(length = 20)
    private String gender;

    private LocalDate dateOfBirth;

    @Column(length = 30)
    private String phoneNumber;

    @Column(length = 150)
    private String email;

    private Long departmentId;
    private Long jobId;             // designation
    private Long roleId;             // assigned role

    @Column(length = 30)
    private String employmentType;  // FULL_TIME, PART_TIME, etc.

    private LocalDate joiningDate;

    @Column(length = 30)
    private String status;          // ACTIVE, INACTIVE

    @Column(name = "photo_url", columnDefinition = "TEXT")
    private String photoUrl;       // Profile image URL (TEXT for base64 or long URLs)

    // If this staff is a doctor, this will be non-null
    @OneToOne(mappedBy = "staff", cascade = CascadeType.ALL, orphanRemoval = true)
    private Doctor doctor;
}
