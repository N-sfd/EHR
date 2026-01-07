-- Create services table
-- This table stores clinic services offered by departments

CREATE TABLE IF NOT EXISTS services (
    service_id BIGSERIAL PRIMARY KEY,
    service_name VARCHAR(200) NOT NULL,
    department_id BIGINT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint to departments table
    CONSTRAINT fk_services_department 
        FOREIGN KEY (department_id) 
        REFERENCES departments(department_id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_department_id ON services(department_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);
CREATE INDEX IF NOT EXISTS idx_services_name ON services(service_name);

-- Add comment to table
COMMENT ON TABLE services IS 'Stores clinic services offered by departments';
COMMENT ON COLUMN services.service_id IS 'Primary key';
COMMENT ON COLUMN services.service_name IS 'Name of the service (e.g., General Consultation, X-Ray)';
COMMENT ON COLUMN services.department_id IS 'Foreign key to departments table';
COMMENT ON COLUMN services.price IS 'Price of the service in decimal format';
COMMENT ON COLUMN services.status IS 'Service status: Active or Inactive';
COMMENT ON COLUMN services.description IS 'Optional description of the service';

