package com.ehr.staffservice.entity.ambulatory;

import com.ehr.staffservice.entity.BaseAuditEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.ArrayList;
import java.util.List;

@Entity(name = "AmbulatoryEncounter")
@Table(name = "encounters", indexes = {
    @Index(name = "idx_encounter_appointment", columnList = "appointment_id"),
    @Index(name = "idx_encounter_patient", columnList = "patient_id"),
    @Index(name = "idx_encounter_status", columnList = "status")
})
@Data
@EqualsAndHashCode(callSuper = false)
public class Encounter extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "encounter_id")
    private Long id;

    @Column(name = "appointment_id")
    private Long appointmentId;

    @Column(name = "patient_id", nullable = false)
    private Long patientId;

    @Column(name = "status", length = 20, nullable = false)
    @Enumerated(EnumType.STRING)
    private EncounterStatus status;

    @Column(name = "rooming_vitals", columnDefinition = "TEXT")
    private String roomingVitals; // JSON string with vitals data

    @Column(name = "med_reconciliation", columnDefinition = "TEXT")
    private String medReconciliation; // JSON string with medication reconciliation data

    @ElementCollection
    @CollectionTable(name = "encounter_diagnoses", joinColumns = @JoinColumn(name = "encounter_id"))
    @Column(name = "diagnosis")
    private List<String> diagnoses = new ArrayList<>(); // ICD-10 codes

    @ElementCollection
    @CollectionTable(name = "encounter_orders", joinColumns = @JoinColumn(name = "encounter_id"))
    @Column(name = "order")
    private List<String> orders = new ArrayList<>(); // Order IDs or descriptions

    @Column(name = "soap_note", columnDefinition = "TEXT")
    private String soapNote; // SOAP note content

    public enum EncounterStatus {
        ROOMING,
        PROVIDER_ENCOUNTER,
        CHECKOUT,
        COMPLETED
    }
}

