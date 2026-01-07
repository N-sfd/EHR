package com.ehr.staffservice.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Table(name = "clinic_settings")
@Data
@EqualsAndHashCode(callSuper = false)
public class ClinicSettings extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "clinic_name", nullable = false, length = 200)
    private String clinicName;

    @Column(name = "legal_name", length = 200)
    private String legalName;

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "address_line1", length = 200)
    private String addressLine1;

    @Column(name = "address_line2", length = 200)
    private String addressLine2;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "phone_number", length = 30)
    private String phoneNumber;

    @Column(name = "alternate_phone_number", length = 30)
    private String alternatePhoneNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "website", length = 200)
    private String website;

    @Column(name = "time_zone", length = 50)
    private String timeZone; // e.g. "America/New_York"

    @Column(name = "default_working_hours", columnDefinition = "TEXT")
    private String defaultWorkingHours; // JSON string or simple string
}

