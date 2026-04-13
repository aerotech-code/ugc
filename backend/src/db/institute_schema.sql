-- Complete Institute ERP Database Schema
-- PostgreSQL

-- ============================================
-- CORE ACADEMIC SYSTEM
-- ============================================

-- Academic Years & Terms
CREATE TABLE IF NOT EXISTS academic_years (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year_code VARCHAR(10) UNIQUE NOT NULL, -- 2024-2025
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, ongoing, completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS academic_terms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  term_name VARCHAR(50) NOT NULL, -- Semester 1, Semester 2, etc.
  term_sequence INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Programs (Bachelor, Master, Diploma)
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_code VARCHAR(20) UNIQUE NOT NULL,
  program_name VARCHAR(200) NOT NULL,
  program_type VARCHAR(50) NOT NULL, -- Bachelor, Master, Diploma, Certificate
  duration_years INT NOT NULL,
  department_id UUID,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dept_code VARCHAR(20) UNIQUE NOT NULL,
  dept_name VARCHAR(200) NOT NULL,
  head_id UUID,
  building_location VARCHAR(100),
  phone VARCHAR(20),
  email VARCHAR(100),
  budget DECIMAL(15, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code VARCHAR(20) UNIQUE NOT NULL,
  course_name VARCHAR(200) NOT NULL,
  credits INT NOT NULL,
  department_id UUID NOT NULL REFERENCES departments(id),
  description TEXT,
  prerequisites TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  max_students INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class Sections
CREATE TABLE IF NOT EXISTS class_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  semester INT NOT NULL, -- 1, 2, 3, etc.
  section_name VARCHAR(50) NOT NULL, -- A, B, C
  capacity INT NOT NULL,
  class_advisor_id UUID,
  room_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(program_id, academic_year_id, semester, section_name)
);

-- Curriculum (which courses in which sections)
CREATE TABLE IF NOT EXISTS curriculum (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_section_id UUID NOT NULL REFERENCES class_sections(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  credit_hours INT NOT NULL,
  sequence_order INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Timetable
CREATE TABLE IF NOT EXISTS timetable (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_section_id UUID NOT NULL REFERENCES class_sections(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  teacher_id UUID NOT NULL,
  room_id UUID NOT NULL,
  day_of_week VARCHAR(10) NOT NULL, -- Monday-Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STUDENT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  photo_url VARCHAR(500),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  country VARCHAR(50),
  postal_code VARCHAR(10),
  guardian_name VARCHAR(100),
  guardian_phone VARCHAR(20),
  guardian_email VARCHAR(100),
  emergency_contact VARCHAR(20),
  enrollment_status VARCHAR(20) DEFAULT 'active', -- active, inactive, graduated, suspended
  enrollment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Enrollment
CREATE TABLE IF NOT EXISTS student_enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  program_id UUID NOT NULL REFERENCES programs(id),
  class_section_id UUID NOT NULL REFERENCES class_sections(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  enrollment_status VARCHAR(20) DEFAULT 'active', -- active, inactive, dropped
  entry_score DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Attendance
CREATE TABLE IF NOT EXISTS student_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
  attendance_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL, -- present, absent, excused, late
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Marks
CREATE TABLE IF NOT EXISTS assessment_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
  assessment_type VARCHAR(50) NOT NULL, -- exam, assignment, practical, project, quiz
  marks_obtained DECIMAL(5, 2) NOT NULL,
  total_marks DECIMAL(5, 2) NOT NULL,
  assessment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grades (computed)
CREATE TABLE IF NOT EXISTS student_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  course_id UUID NOT NULL REFERENCES courses(id),
  academic_term_id UUID NOT NULL REFERENCES academic_terms(id),
  grade_point DECIMAL(3, 2), -- 4.0, 3.5, 3.0, etc.
  grade_letter VARCHAR(2), -- A, B+, B, C+, C, D, F
  total_marks DECIMAL(5, 2),
  percentage DECIMAL(5, 2),
  grade_status VARCHAR(20), -- passed, failed, incomplete
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Progress & Academic Standing
CREATE TABLE IF NOT EXISTS student_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  gpa DECIMAL(4, 3),
  total_credits_earned INT,
  total_credits_registered INT,
  standing VARCHAR(50), -- good, probation, warning, suspended
  status_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conduct Records (Disciplinary)
CREATE TABLE IF NOT EXISTS conduct_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  incident_type VARCHAR(100) NOT NULL,
  incident_date DATE NOT NULL,
  description TEXT,
  action_taken VARCHAR(200),
  severity VARCHAR(20), -- minor, major, severe
  recorded_by_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FINANCE & FEES MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS fee_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_code VARCHAR(20) UNIQUE NOT NULL,
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_structure (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  fee_category_id UUID NOT NULL REFERENCES fee_categories(id),
  amount DECIMAL(12, 2) NOT NULL,
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_fees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  fee_category_id UUID NOT NULL REFERENCES fee_categories(id),
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) DEFAULT 0,
  outstanding_amount DECIMAL(12, 2),
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- pending, partial, paid, overdue
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_fee_id UUID NOT NULL REFERENCES student_fees(id),
  payment_amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- cash, cheque, bank_transfer, card
  reference_number VARCHAR(100),
  receipt_number VARCHAR(100) UNIQUE,
  received_by_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- LIBRARY MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS library_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn VARCHAR(20) UNIQUE,
  book_code VARCHAR(20) UNIQUE NOT NULL,
  title VARCHAR(300) NOT NULL,
  author VARCHAR(200),
  publisher VARCHAR(200),
  publication_year INT,
  category_id UUID REFERENCES library_categories(id),
  shelf_location VARCHAR(50),
  total_copies INT NOT NULL,
  available_copies INT NOT NULL,
  cost DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS library_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_code VARCHAR(20) UNIQUE NOT NULL,
  member_name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  member_type VARCHAR(50), -- student, teacher, staff, public
  member_since DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS book_borrowing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES library_books(id),
  member_id UUID NOT NULL REFERENCES library_members(id),
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE,
  status VARCHAR(20) DEFAULT 'borrowed', -- borrowed, returned, overdue
  renewal_count INT DEFAULT 0,
  fine_amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TRANSPORT MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_code VARCHAR(20) UNIQUE NOT NULL,
  route_name VARCHAR(100) NOT NULL,
  start_point VARCHAR(100) NOT NULL,
  end_point VARCHAR(100) NOT NULL,
  distance_km DECIMAL(8, 2),
  estimated_duration INT, -- in minutes
  stops INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  registration_number VARCHAR(20) UNIQUE NOT NULL,
  vehicle_type VARCHAR(50), -- bus, van, car
  capacity INT,
  driver_id UUID,
  route_id UUID REFERENCES routes(id),
  purchase_date DATE,
  last_service_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_code VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  license_number VARCHAR(50) UNIQUE,
  license_expiry DATE,
  phone VARCHAR(20),
  email VARCHAR(100),
  address TEXT,
  date_of_birth DATE,
  joining_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_route_assignment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  route_id UUID NOT NULL REFERENCES routes(id),
  pickup_point VARCHAR(100),
  dropoff_point VARCHAR(100),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HOSTEL MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS hostels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_name VARCHAR(100) NOT NULL,
  hostel_type VARCHAR(50), -- boys, girls, co-ed
  location VARCHAR(100),
  total_capacity INT,
  wardens_contact VARCHAR(20),
  rules_document TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id UUID NOT NULL REFERENCES hostels(id),
  room_number VARCHAR(50) NOT NULL,
  floor_number INT,
  room_type VARCHAR(50), -- single, double, triple
  capacity INT NOT NULL,
  current_occupancy INT DEFAULT 0,
  features TEXT,
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS hostel_allocation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id),
  room_id UUID NOT NULL REFERENCES hostel_rooms(id),
  academic_year_id UUID NOT NULL REFERENCES academic_years(id),
  checkin_date DATE,
  checkout_date DATE,
  status VARCHAR(20) DEFAULT 'allocated', -- allocated, active, checkout
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FACILITIES & INFRASTRUCTURE
-- ============================================

CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_code VARCHAR(20) UNIQUE NOT NULL,
  building_name VARCHAR(100) NOT NULL,
  floors INT,
  location VARCHAR(200),
  constructed_year INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id UUID NOT NULL REFERENCES buildings(id),
  room_number VARCHAR(50) NOT NULL,
  room_type VARCHAR(50), -- classroom, lab, office, meeting room, auditorium
  capacity INT,
  features TEXT, -- projector, whiteboard, ac, etc.
  status VARCHAR(20) DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  facility_code VARCHAR(20) UNIQUE NOT NULL,
  facility_name VARCHAR(100) NOT NULL,
  facility_type VARCHAR(50), -- lab, sports, medical, cafeteria, gym
  location VARCHAR(100),
  capacity INT,
  maintenance_contact VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code VARCHAR(20) UNIQUE NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  asset_type VARCHAR(50), -- laptop, furniture, equipment, vehicle
  purchase_date DATE,
  cost DECIMAL(12, 2),
  location_id UUID,
  status VARCHAR(20) DEFAULT 'active',
  assigned_to_id UUID,
  warranty_expiry DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- STAFF & ROLES
-- ============================================

CREATE TABLE IF NOT EXISTS staff_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_code VARCHAR(50) UNIQUE NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB, -- array of permission strings
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_code VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  date_of_birth DATE,
  gender VARCHAR(20),
  address TEXT,
  city VARCHAR(50),
  state VARCHAR(50),
  country VARCHAR(50),
  postal_code VARCHAR(10),
  joining_date DATE,
  designation VARCHAR(100),
  department_id UUID REFERENCES departments(id),
  role_id UUID REFERENCES staff_roles(id),
  salary DECIMAL(12, 2),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, retired, resigned
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Teacher specific details
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id),
  qualification TEXT,
  specialization VARCHAR(100),
  total_experience_years INT,
  department_id UUID NOT NULL REFERENCES departments(id),
  courses_assigned TEXT,
  office_hours TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- NOTIFICATIONS & COMMUNICATION
-- ============================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  announcement_type VARCHAR(50), -- academic, administrative, urgent
  posted_by_id UUID NOT NULL,
  posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expiry_date TIMESTAMP,
  visibility VARCHAR(50), -- all, students, staff, parents
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  notification_type VARCHAR(50),
  title VARCHAR(200),
  message TEXT,
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_code VARCHAR(20) UNIQUE NOT NULL,
  complainant_id UUID NOT NULL,
  complaint_type VARCHAR(100),
  description TEXT,
  status VARCHAR(20) DEFAULT 'open', -- open, under review, resolved, closed
  assigned_to_id UUID,
  resolution TEXT,
  resolved_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_students_email ON students(email);
CREATE INDEX idx_students_code ON students(student_code);
CREATE INDEX idx_student_enrollment_student ON student_enrollment(student_id);
CREATE INDEX idx_student_enrollment_program ON student_enrollment(program_id);
CREATE INDEX idx_student_enrollment_year ON student_enrollment(academic_year_id);
CREATE INDEX idx_student_attendance_student ON student_attendance(student_id);
CREATE INDEX idx_student_attendance_date ON student_attendance(attendance_date);
CREATE INDEX idx_assessment_marks_student ON assessment_marks(student_id);
CREATE INDEX idx_assessment_marks_term ON assessment_marks(academic_term_id);
CREATE INDEX idx_student_fees_student ON student_fees(student_id);
CREATE INDEX idx_student_fees_year ON student_fees(academic_year_id);
CREATE INDEX idx_student_fees_status ON student_fees(status);
CREATE INDEX idx_fee_payments_student_fee ON fee_payments(student_fee_id);
CREATE INDEX idx_book_borrowing_member ON book_borrowing(member_id);
CREATE INDEX idx_book_borrowing_status ON book_borrowing(status);
CREATE INDEX idx_book_borrowing_due_date ON book_borrowing(due_date);
CREATE INDEX idx_timetable_section ON timetable(class_section_id);
CREATE INDEX idx_timetable_course ON timetable(course_id);
CREATE INDEX idx_timetable_term ON timetable(academic_term_id);
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_code ON staff(staff_code);
CREATE INDEX idx_teachers_department ON teachers(department_id);
CREATE INDEX idx_announcements_posted_date ON announcements(posted_date);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
