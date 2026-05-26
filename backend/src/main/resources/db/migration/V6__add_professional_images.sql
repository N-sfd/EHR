-- Add Professional Images for Doctors, Staff (Nurses), and Patients
-- Using professional medical images from Unsplash

-- Update Staff/Doctors with professional doctor images
UPDATE staff s
SET photo_url = CASE 
    -- Doctors (professional headshots with white coats)
    WHEN s.staff_code = 'S-001' THEN 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-002' THEN 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-003' THEN 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-004' THEN 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-005' THEN 'https://images.unsplash.com/photo-1594824476968-48fd8d0c0276?w=400&h=400&fit=crop&crop=faces'
    -- Nurses (professional headshots with scrubs)
    WHEN s.staff_code = 'S-006' THEN 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-007' THEN 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-008' THEN 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-009' THEN 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces'
    WHEN s.staff_code = 'S-010' THEN 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=faces'
    ELSE photo_url
END
WHERE s.staff_code IN ('S-001', 'S-002', 'S-003', 'S-004', 'S-005', 'S-006', 'S-007', 'S-008', 'S-009', 'S-010');

-- Update Patients with diverse professional patient images
UPDATE patients p
SET photo_url = CASE 
    WHEN p.patient_code = 'MRN001' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN002' THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN003' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN004' THEN 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN005' THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN006' THEN 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN007' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN008' THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN009' THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN010' THEN 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN011' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN012' THEN 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN013' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN014' THEN 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=faces'
    WHEN p.patient_code = 'MRN015' THEN 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces'
    ELSE photo_url
END
WHERE p.patient_code IN ('MRN001', 'MRN002', 'MRN003', 'MRN004', 'MRN005', 'MRN006', 'MRN007', 'MRN008', 'MRN009', 'MRN010', 'MRN011', 'MRN012', 'MRN013', 'MRN014', 'MRN015');

-- Also update patient_access_patients table if it exists
UPDATE patient_access_patients p
SET photo_url = CASE 
    WHEN p.mrn = 'MRN001' THEN 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces'
    WHEN p.mrn = 'MRN002' THEN 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=faces'
    WHEN p.mrn = 'MRN003' THEN 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces'
    ELSE photo_url
END
WHERE p.mrn IN ('MRN001', 'MRN002', 'MRN003');

