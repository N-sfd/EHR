-- Create questionnaire table (form template)
CREATE TABLE questionnaire (
    questionnaire_id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    version INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create questionnaire_question table (questions within a questionnaire)
CREATE TABLE questionnaire_question (
    question_id BIGSERIAL PRIMARY KEY,
    questionnaire_id BIGINT NOT NULL REFERENCES questionnaire(questionnaire_id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL CHECK (question_type IN ('TEXT', 'NUMBER', 'YES_NO', 'MULTIPLE_CHOICE', 'SCALE')),
    options JSONB, -- For MULTIPLE_CHOICE: ["Option 1", "Option 2"], for SCALE: {"min": 0, "max": 10, "labels": ["Low", "High"]}
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create questionnaire_assignment table (assignments to patients)
CREATE TABLE questionnaire_assignment (
    assignment_id BIGSERIAL PRIMARY KEY,
    questionnaire_id BIGINT NOT NULL REFERENCES questionnaire(questionnaire_id) ON DELETE CASCADE,
    patient_id BIGINT NOT NULL REFERENCES patients(patient_id) ON DELETE CASCADE,
    assigned_by BIGINT REFERENCES staff(staff_id),
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED' CHECK (status IN ('ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED')),
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create questionnaire_response table (patient responses to assignments)
CREATE TABLE questionnaire_response (
    response_id BIGSERIAL PRIMARY KEY,
    assignment_id BIGINT NOT NULL REFERENCES questionnaire_assignment(assignment_id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questionnaire_question(question_id) ON DELETE CASCADE,
    answer_text TEXT, -- For TEXT, NUMBER, YES_NO (as string), MULTIPLE_CHOICE (selected option)
    answer_number NUMERIC, -- For NUMBER and SCALE questions
    answer_json JSONB, -- For complex answers or multiple selections
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, question_id) -- One answer per question per assignment
);

-- Indexes for performance
CREATE INDEX idx_questionnaire_question_questionnaire_id ON questionnaire_question(questionnaire_id);
CREATE INDEX idx_questionnaire_assignment_patient_id ON questionnaire_assignment(patient_id);
CREATE INDEX idx_questionnaire_assignment_status ON questionnaire_assignment(patient_id, status);
CREATE INDEX idx_questionnaire_assignment_due_date ON questionnaire_assignment(due_date);
CREATE INDEX idx_questionnaire_response_assignment_id ON questionnaire_response(assignment_id);
CREATE INDEX idx_questionnaire_response_question_id ON questionnaire_response(question_id);

-- Seed sample questionnaires

-- 1. Patient Intake Form
DO $$
DECLARE
  intake_id BIGINT;
BEGIN
  INSERT INTO questionnaire (title, description, version, is_active) VALUES
  ('Patient Intake Form', 'Please complete this form before your visit to help us better understand your health history and current concerns.', 1, true)
  RETURNING questionnaire_id INTO intake_id;

  INSERT INTO questionnaire_question (questionnaire_id, question_text, question_type, is_required, display_order) VALUES
  (intake_id, 'What is the primary reason for your visit today?', 'TEXT', true, 1),
  (intake_id, 'Have you had any recent surgeries?', 'YES_NO', false, 2),
  (intake_id, 'Are you currently taking any medications?', 'YES_NO', true, 3),
  (intake_id, 'Do you have any known allergies?', 'YES_NO', true, 4),
  (intake_id, 'On a scale of 1-10, how would you rate your current pain level?', 'SCALE', false, 5);

  -- Update SCALE question with options
  UPDATE questionnaire_question 
  SET options = '{"min": 1, "max": 10, "labels": {"1": "No pain", "10": "Severe pain"}}'::jsonb
  WHERE questionnaire_id = intake_id AND question_text = 'On a scale of 1-10, how would you rate your current pain level?';

  -- Seed assignments for patient1 (patient_id = 1) - Intake form due in 3 days
  INSERT INTO questionnaire_assignment (questionnaire_id, patient_id, assigned_by, assigned_date, due_date, status) VALUES
  (intake_id, 1, 1, CURRENT_DATE, CURRENT_DATE + INTERVAL '3 days', 'ASSIGNED');

  -- Seed assignments for patient2 (patient_id = 2) - Intake form due in 2 days
  INSERT INTO questionnaire_assignment (questionnaire_id, patient_id, assigned_by, assigned_date, due_date, status) VALUES
  (intake_id, 2, 1, CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE + INTERVAL '2 days', 'ASSIGNED');
END $$;

-- 2. PHQ-9 Depression Screening
DO $$
DECLARE
  phq_id BIGINT;
BEGIN
  INSERT INTO questionnaire (title, description, version, is_active) VALUES
  ('PHQ-9 Depression Screening', 'Over the last 2 weeks, how often have you been bothered by any of the following problems?', 1, true)
  RETURNING questionnaire_id INTO phq_id;

  INSERT INTO questionnaire_question (questionnaire_id, question_text, question_type, options, is_required, display_order) VALUES
  (phq_id, 'Little interest or pleasure in doing things', 'MULTIPLE_CHOICE', '["Not at all", "Several days", "More than half the days", "Nearly every day"]'::jsonb, true, 1),
  (phq_id, 'Feeling down, depressed, or hopeless', 'MULTIPLE_CHOICE', '["Not at all", "Several days", "More than half the days", "Nearly every day"]'::jsonb, true, 2),
  (phq_id, 'Trouble falling or staying asleep, or sleeping too much', 'MULTIPLE_CHOICE', '["Not at all", "Several days", "More than half the days", "Nearly every day"]'::jsonb, true, 3),
  (phq_id, 'Feeling tired or having little energy', 'MULTIPLE_CHOICE', '["Not at all", "Several days", "More than half the days", "Nearly every day"]'::jsonb, true, 4),
  (phq_id, 'Poor appetite or overeating', 'MULTIPLE_CHOICE', '["Not at all", "Several days", "More than half the days", "Nearly every day"]'::jsonb, true, 5);

  -- Seed assignment for patient1 (patient_id = 1) - PHQ-9 due in 5 days
  INSERT INTO questionnaire_assignment (questionnaire_id, patient_id, assigned_by, assigned_date, due_date, status) VALUES
  (phq_id, 1, 1, CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE + INTERVAL '5 days', 'ASSIGNED');
END $$;

