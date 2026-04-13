-- Admission Schema

CREATE TABLE IF NOT EXISTS admission_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_name VARCHAR(255) NOT NULL,
  total_seats INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admission_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES admission_courses(id),
  applicant_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  score DECIMAL(5, 2) NOT NULL,
  category VARCHAR(50) NOT NULL, -- General, OBC, SC, ST, etc.
  status VARCHAR(50) DEFAULT 'applied', -- applied, merit_listed, allocated, cancelled
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS merit_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES admission_applications(id) ON DELETE CASCADE,
  course_id UUID REFERENCES admission_courses(id),
  score DECIMAL(5, 2) NOT NULL,
  rank INTEGER NOT NULL,
  category VARCHAR(50) NOT NULL,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS seat_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES admission_applications(id) ON DELETE CASCADE,
  course_id UUID REFERENCES admission_courses(id),
  category VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'allocated', -- allocated, upgraded, cancelled
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed some courses for testing
INSERT INTO admission_courses (course_name, total_seats) VALUES 
('Computer Science', 50),
('Electronics', 40),
('Mechanical', 30)
ON CONFLICT DO NOTHING;

-- Seed some applications for testing
INSERT INTO admission_applications (applicant_name, email, course_id, score, category)
SELECT 'John Doe', 'john.doe@example.com', id, 85.5, 'General' FROM admission_courses WHERE course_name = 'Computer Science'
UNION ALL
SELECT 'Jane Smith', 'jane.smith@example.com', id, 92.0, 'General' FROM admission_courses WHERE course_name = 'Computer Science'
UNION ALL
SELECT 'Alice Johnson', 'alice.j@example.com', id, 78.5, 'OBC' FROM admission_courses WHERE course_name = 'Computer Science'
UNION ALL
SELECT 'Bob Brown', 'bob.b@example.com', id, 88.0, 'SC' FROM admission_courses WHERE course_name = 'Computer Science'
ON CONFLICT DO NOTHING;
