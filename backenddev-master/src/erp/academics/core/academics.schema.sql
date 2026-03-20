CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS academics_semesters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  start_date DATE,
  end_date DATE,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academics_semester_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  semester_id UUID NOT NULL REFERENCES academics_semesters(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name VARCHAR(255),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (semester_id, student_id)
);

CREATE TABLE IF NOT EXISTS academics_internal_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester_id UUID NOT NULL REFERENCES academics_semesters(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  max_marks NUMERIC(5, 2) NOT NULL,
  passing_marks NUMERIC(5, 2) NOT NULL,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academics_internal_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  internal_exam_id UUID NOT NULL REFERENCES academics_internal_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  marks NUMERIC(5, 2) NOT NULL,
  entered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (internal_exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS academics_final_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester_id UUID NOT NULL REFERENCES academics_semesters(id) ON DELETE CASCADE,
  course_id UUID NOT NULL,
  name VARCHAR(255) NOT NULL,
  exam_date DATE,
  max_marks NUMERIC(5, 2) NOT NULL,
  passing_marks NUMERIC(5, 2) NOT NULL,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academics_final_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  final_exam_id UUID NOT NULL REFERENCES academics_final_exams(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  marks NUMERIC(5, 2) NOT NULL,
  entered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (final_exam_id, student_id)
);

CREATE TABLE IF NOT EXISTS academics_back_exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester_id UUID NOT NULL REFERENCES academics_semesters(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  course_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'registered' CHECK (status IN ('registered', 'scheduled', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academics_back_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  back_exam_id UUID NOT NULL REFERENCES academics_back_exams(id) ON DELETE CASCADE,
  marks NUMERIC(5, 2) NOT NULL,
  entered_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academics_exam_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  academic_year VARCHAR(20) NOT NULL,
  semester_id UUID NOT NULL REFERENCES academics_semesters(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  total_marks NUMERIC(7, 2),
  grade VARCHAR(5),
  status VARCHAR(20) NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'published')),
  processed_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, academic_year, semester_id, student_id)
);

CREATE TABLE IF NOT EXISTS academics_transcriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  student_id UUID NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'approved', 'rejected')),
  requested_on TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  approved_on TIMESTAMPTZ,
  approved_by UUID
);

CREATE INDEX IF NOT EXISTS idx_academics_semesters_inst ON academics_semesters(institution_id, academic_year);
CREATE INDEX IF NOT EXISTS idx_academics_internal_exams_inst ON academics_internal_exams(institution_id, academic_year, semester_id);
CREATE INDEX IF NOT EXISTS idx_academics_final_exams_inst ON academics_final_exams(institution_id, academic_year, semester_id);
CREATE INDEX IF NOT EXISTS idx_academics_exam_results_student ON academics_exam_results(student_id);
CREATE INDEX IF NOT EXISTS idx_academics_transcriptions_student ON academics_transcriptions(student_id);
