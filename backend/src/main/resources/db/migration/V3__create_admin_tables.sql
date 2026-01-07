-- Admin Tables

CREATE TABLE IF NOT EXISTS visit_types (
    visit_type_id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    duration_mins INTEGER NOT NULL,
    allow_overbook BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visit_type_departments (
    visit_type_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    FOREIGN KEY (visit_type_id) REFERENCES visit_types(visit_type_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES departments(department_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visit_type_resources (
    visit_type_id BIGINT NOT NULL,
    resource VARCHAR(255),
    FOREIGN KEY (visit_type_id) REFERENCES visit_types(visit_type_id) ON DELETE CASCADE
);

