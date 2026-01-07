-- Ambulatory (Encounters) Tables

CREATE TABLE IF NOT EXISTS encounters (
    encounter_id BIGSERIAL PRIMARY KEY,
    appointment_id BIGINT,
    patient_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL,
    rooming_vitals TEXT,
    med_reconciliation TEXT,
    soap_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id),
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
);

CREATE INDEX idx_encounter_appointment ON encounters(appointment_id);
CREATE INDEX idx_encounter_patient ON encounters(patient_id);
CREATE INDEX idx_encounter_status ON encounters(status);

CREATE TABLE IF NOT EXISTS encounter_diagnoses (
    encounter_id BIGINT NOT NULL,
    diagnosis VARCHAR(255),
    FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS encounter_orders (
    encounter_id BIGINT NOT NULL,
    order VARCHAR(255),
    FOREIGN KEY (encounter_id) REFERENCES encounters(encounter_id) ON DELETE CASCADE
);

