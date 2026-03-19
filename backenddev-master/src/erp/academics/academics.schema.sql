CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS academics_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  department VARCHAR(255),
  credits INTEGER,
  duration VARCHAR(50),
  level VARCHAR(30) CHECK (level IS NULL OR level IN ('UG', 'PG', 'Diploma', 'Certificate')),
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, code)
);

CREATE INDEX IF NOT EXISTS idx_academics_courses_institution ON academics_courses(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_courses_status ON academics_courses(institution_id, status);
CREATE INDEX IF NOT EXISTS idx_academics_courses_department ON academics_courses(institution_id, department);

-- ==================== SYLLABI ====================

CREATE TABLE IF NOT EXISTS academics_syllabi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES academics_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  unit_number INTEGER,
  topics JSONB NOT NULL DEFAULT '[]'::jsonb,
  learning_objectives JSONB NOT NULL DEFAULT '[]'::jsonb,
  teaching_hours INTEGER,
  reference_books JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academics_syllabi_institution ON academics_syllabi(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_syllabi_course ON academics_syllabi(institution_id, course_id);
CREATE INDEX IF NOT EXISTS idx_academics_syllabi_status ON academics_syllabi(institution_id, status);

-- ==================== CREDITS ====================

CREATE TABLE IF NOT EXISTS academics_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES academics_courses(id) ON DELETE CASCADE,
  theory_credits NUMERIC(4, 1) NOT NULL DEFAULT 0,
  practical_credits NUMERIC(4, 1) NOT NULL DEFAULT 0,
  total_credits NUMERIC(4, 1) NOT NULL DEFAULT 0,
  lecture_hours_per_week NUMERIC(4, 1),
  tutorial_hours_per_week NUMERIC(4, 1),
  practical_hours_per_week NUMERIC(4, 1),
  remarks TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (institution_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_academics_credits_institution ON academics_credits(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_credits_course ON academics_credits(institution_id, course_id);

-- ==================== FEEDBACK ====================

CREATE TABLE IF NOT EXISTS academics_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES academics_courses(id) ON DELETE CASCADE,
  student_id UUID,
  student_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  category VARCHAR(50) CHECK (category IS NULL OR category IN ('course_content', 'teaching', 'assessment', 'infrastructure', 'general')),
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'flagged')),
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academics_feedback_institution ON academics_feedback(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_feedback_course ON academics_feedback(institution_id, course_id);
CREATE INDEX IF NOT EXISTS idx_academics_feedback_student ON academics_feedback(institution_id, student_id);

-- ==================== TIMETABLE ====================

CREATE TABLE IF NOT EXISTS academics_timetables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  semester_id UUID,
  department_id UUID,
  name VARCHAR(255) NOT NULL,
  schedule JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'draft')),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academics_timetables_institution ON academics_timetables(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_timetables_semester ON academics_timetables(institution_id, semester_id);
CREATE INDEX IF NOT EXISTS idx_academics_timetables_department ON academics_timetables(institution_id, department_id);

-- ==================== ASSIGNMENTS ====================

CREATE TABLE IF NOT EXISTS academics_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  course_id UUID NOT NULL REFERENCES academics_courses(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  max_score NUMERIC(5, 2),
  status VARCHAR(20) NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'closed')),
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_academics_assignments_institution ON academics_assignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_assignments_course ON academics_assignments(institution_id, course_id);

CREATE TABLE IF NOT EXISTS academics_assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL,
  assignment_id UUID NOT NULL REFERENCES academics_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name VARCHAR(255),
  content TEXT,
  file_url VARCHAR(1024),
  score NUMERIC(5, 2),
  feedback TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'late', 'graded')),
  graded_by UUID,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_academics_submissions_institution ON academics_assignment_submissions(institution_id);
CREATE INDEX IF NOT EXISTS idx_academics_submissions_assignment ON academics_assignment_submissions(institution_id, assignment_id);
CREATE INDEX IF NOT EXISTS idx_academics_submissions_student ON academics_assignment_submissions(institution_id, student_id);
