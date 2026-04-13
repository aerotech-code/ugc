-- Admissions Module Schema

-- Applications Table
CREATE TABLE IF NOT EXISTS admission_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    applicant_name VARCHAR(255) NOT NULL,
    applicant_email VARCHAR(255) NOT NULL,
    applicant_phone VARCHAR(50),
    course_id UUID,
    status VARCHAR(50) DEFAULT 'submitted', -- submitted, under_review, accepted, rejected, withdrawn
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    updated_by UUID
);

-- Documents Table
CREATE TABLE IF NOT EXISTS admission_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100) NOT NULL, -- e.g., transcript, id_proof, photo
    file_url TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, verified, rejected
    rejection_reason TEXT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    verified_at TIMESTAMP WITH TIME ZONE,
    uploaded_by UUID,
    verified_by UUID
);

-- Entrance Tests Table
CREATE TABLE IF NOT EXISTS admission_entrance_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    test_name VARCHAR(255) NOT NULL,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL,
    venue VARCHAR(255),
    max_score INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID
);

-- Entrance Test Registrations / Results Table
CREATE TABLE IF NOT EXISTS admission_test_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    institution_id UUID NOT NULL,
    application_id UUID NOT NULL REFERENCES admission_applications(id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES admission_entrance_tests(id) ON DELETE CASCADE,
    admit_card_url TEXT,
    score INTEGER,
    result_status VARCHAR(50) DEFAULT 'pending', -- pending, passed, failed
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(application_id, test_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_admission_applications_inst ON admission_applications(institution_id);
CREATE INDEX IF NOT EXISTS idx_admission_documents_app ON admission_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_admission_test_reg_app ON admission_test_registrations(application_id);
