-- Seed demo data for MyChart dashboard
-- Creates sample appointments, messages, questionnaires, and billing data for patient1 and patient2

DO $$
DECLARE
    patient1_id BIGINT;
    patient2_id BIGINT;
    provider1_id BIGINT;
    provider2_id BIGINT;
    thread1_id BIGINT;
    questionnaire1_id BIGINT;
BEGIN
    -- Get patient IDs
    SELECT patient_id INTO patient1_id FROM patients WHERE patient_code = 'P001' LIMIT 1;
    SELECT patient_id INTO patient2_id FROM patients WHERE patient_code = 'P002' LIMIT 1;
    
    -- Get provider IDs (from doctors/staff)
    SELECT staff_id INTO provider1_id FROM doctors LIMIT 1;
    SELECT staff_id INTO provider2_id FROM doctors OFFSET 1 LIMIT 1;
    
    -- Only proceed if we have patients and providers
    IF patient1_id IS NOT NULL AND provider1_id IS NOT NULL THEN
        
        -- ============================================
        -- UPCOMING APPOINTMENTS (next 30 days)
        -- ============================================
        
        -- Patient1: Appointment next week
        INSERT INTO appointments (patient_id, doctor_id, start_at, end_at, duration_minutes, status, appointment_type, reason, created_at, updated_at)
        SELECT 
            patient1_id,
            provider1_id,
            (CURRENT_DATE + INTERVAL '7 days')::timestamp + INTERVAL '10 hours',
            (CURRENT_DATE + INTERVAL '7 days')::timestamp + INTERVAL '10 hours 30 minutes',
            30,
            'SCHEDULED',
            'Follow-up',
            'Routine checkup',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        WHERE NOT EXISTS (
            SELECT 1 FROM appointments 
            WHERE patient_id = patient1_id 
            AND start_at::date = (CURRENT_DATE + INTERVAL '7 days')::date
        );
        
        -- Patient1: Appointment in 2 weeks
        INSERT INTO appointments (patient_id, doctor_id, start_at, end_at, duration_minutes, status, appointment_type, reason, created_at, updated_at)
        SELECT 
            patient1_id,
            provider2_id,
            (CURRENT_DATE + INTERVAL '14 days')::timestamp + INTERVAL '14 hours',
            (CURRENT_DATE + INTERVAL '14 days')::timestamp + INTERVAL '14 hours 30 minutes',
            30,
            'CONFIRMED',
            'Consultation',
            'Annual physical',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        WHERE NOT EXISTS (
            SELECT 1 FROM appointments 
            WHERE patient_id = patient1_id 
            AND start_at::date = (CURRENT_DATE + INTERVAL '14 days')::date
        );
        
        -- Patient2: Appointment next week
        IF patient2_id IS NOT NULL THEN
            INSERT INTO appointments (patient_id, doctor_id, start_at, end_at, duration_minutes, status, appointment_type, reason, created_at, updated_at)
            SELECT 
                patient2_id,
                provider1_id,
                (CURRENT_DATE + INTERVAL '5 days')::timestamp + INTERVAL '11 hours',
                (CURRENT_DATE + INTERVAL '5 days')::timestamp + INTERVAL '11 hours 30 minutes',
                30,
                'SCHEDULED',
                'Follow-up',
                'Lab results review',
                CURRENT_TIMESTAMP,
                CURRENT_TIMESTAMP
            WHERE NOT EXISTS (
                SELECT 1 FROM appointments 
                WHERE patient_id = patient2_id 
                AND start_at::date = (CURRENT_DATE + INTERVAL '5 days')::date
            );
        END IF;
        
        -- ============================================
        -- UNREAD MESSAGES
        -- ============================================
        
        -- Create message thread for patient1 with unread messages
        INSERT INTO message_thread (subject, created_by, created_by_type, created_at, updated_at)
        SELECT 
            'Lab Results Discussion',
            patient1_id,
            'PATIENT',
            CURRENT_TIMESTAMP - INTERVAL '2 days',
            CURRENT_TIMESTAMP - INTERVAL '1 hour'
        WHERE NOT EXISTS (
            SELECT 1 FROM message_thread WHERE subject = 'Lab Results Discussion' AND created_by = patient1_id
        )
        RETURNING thread_id INTO thread1_id;
        
        -- Add provider as participant and unread message
        IF thread1_id IS NOT NULL THEN
            INSERT INTO message_participant (thread_id, participant_id_ref, participant_type)
            SELECT thread1_id, provider1_id, 'PROVIDER'
            WHERE NOT EXISTS (
                SELECT 1 FROM message_participant 
                WHERE thread_id = thread1_id AND participant_id_ref = provider1_id
            );
            
            -- Add unread message from provider
            INSERT INTO message (thread_id, sender_id, sender_type, body, sent_at, read_at)
            SELECT 
                thread1_id,
                provider1_id,
                'PROVIDER',
                'Your recent lab results look good overall. We should discuss the cholesterol levels at your next appointment.',
                CURRENT_TIMESTAMP - INTERVAL '1 hour',
                NULL  -- Unread
            WHERE NOT EXISTS (
                SELECT 1 FROM message 
                WHERE thread_id = thread1_id 
                AND sender_id = provider1_id 
                AND sent_at > CURRENT_TIMESTAMP - INTERVAL '2 hours'
            );
        END IF;
        
        -- ============================================
        -- OPEN QUESTIONNAIRES
        -- ============================================
        
        -- Ensure questionnaires exist
        INSERT INTO questionnaire (title, description, is_active, created_at)
        SELECT 'Health Intake Form', 'Please complete your health intake questionnaire', true, CURRENT_TIMESTAMP
        WHERE NOT EXISTS (SELECT 1 FROM questionnaire WHERE title = 'Health Intake Form')
        RETURNING questionnaire_id INTO questionnaire1_id;
        
        -- Create assignment for patient1 (due soon)
        IF questionnaire1_id IS NOT NULL THEN
            INSERT INTO questionnaire_assignment (questionnaire_id, patient_id, due_date, status, assigned_at)
            SELECT 
                questionnaire1_id,
                patient1_id,
                CURRENT_DATE + INTERVAL '3 days',
                'ASSIGNED',
                CURRENT_TIMESTAMP
            WHERE NOT EXISTS (
                SELECT 1 FROM questionnaire_assignment 
                WHERE questionnaire_id = questionnaire1_id
                AND patient_id = patient1_id
                AND status = 'ASSIGNED'
            );
        END IF;
        
        -- ============================================
        -- BILLING DATA (if billing tables exist)
        -- ============================================
        
        -- Check if billing_statement table exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'billing_statement') THEN
            -- Patient1: Pending statement
            DECLARE
                stmt_id BIGINT;
            BEGIN
                INSERT INTO billing_statement (patient_id, statement_number, statement_date, due_date, total_amount, paid_amount, balance_due, status, created_at, updated_at)
                SELECT 
                    patient1_id,
                    'STMT-' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-001',
                    CURRENT_DATE - INTERVAL '5 days',
                    CURRENT_DATE + INTERVAL '10 days',
                    250.00,
                    0.00,
                    250.00,
                    'PENDING',
                    CURRENT_TIMESTAMP,
                    CURRENT_TIMESTAMP
                WHERE NOT EXISTS (
                    SELECT 1 FROM billing_statement 
                    WHERE patient_id = patient1_id 
                    AND statement_number LIKE 'STMT-%'
                    AND status = 'PENDING'
                    AND statement_date > CURRENT_DATE - INTERVAL '10 days'
                )
                RETURNING statement_id INTO stmt_id;
                
                -- Add line items if statement was created
                IF stmt_id IS NOT NULL THEN
                    INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order, created_at)
                    SELECT 
                        stmt_id,
                        'Office Visit - Follow-up',
                        CURRENT_DATE - INTERVAL '30 days',
                        1,
                        150.00,
                        150.00,
                        1,
                        CURRENT_TIMESTAMP
                    WHERE NOT EXISTS (
                        SELECT 1 FROM billing_line_item 
                        WHERE statement_id = stmt_id
                        AND description = 'Office Visit - Follow-up'
                    );
                    
                    INSERT INTO billing_line_item (statement_id, description, service_date, quantity, unit_price, total_price, display_order, created_at)
                    SELECT 
                        stmt_id,
                        'Lab Work - Blood Test',
                        CURRENT_DATE - INTERVAL '25 days',
                        1,
                        100.00,
                        100.00,
                        2,
                        CURRENT_TIMESTAMP
                    WHERE NOT EXISTS (
                        SELECT 1 FROM billing_line_item 
                        WHERE statement_id = stmt_id
                        AND description = 'Lab Work - Blood Test'
                    );
                END IF;
            END;
        END IF;
        
        -- ============================================
        -- SET PRIMARY DOCTOR (PCP)
        -- ============================================
        
        -- Set provider1 as PCP for patient1
        UPDATE patients 
        SET primary_doctor_id = provider1_id,
            primary_provider_id = provider1_id
        WHERE patient_id = patient1_id 
        AND (primary_doctor_id IS NULL OR primary_doctor_id != provider1_id);
        
    END IF;
END $$;

-- Verify seeded data
SELECT 
    'Dashboard Demo Data Seeded' as status,
    (SELECT COUNT(*) FROM appointments WHERE start_at::date >= CURRENT_DATE AND start_at::date <= CURRENT_DATE + INTERVAL '30 days') as upcoming_appointments,
    (SELECT COUNT(*) FROM message WHERE read_at IS NULL) as unread_messages,
    (SELECT COUNT(*) FROM questionnaire_assignment WHERE status IN ('ASSIGNED', 'IN_PROGRESS')) as open_questionnaires,
    (SELECT COUNT(*) FROM billing_statement WHERE status = 'PENDING') as pending_statements;
