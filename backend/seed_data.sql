-- Seed data with fixed UUIDs for easy testing

-- 1. Create Tables (just in case they haven't been created yet)
CREATE TABLE IF NOT EXISTS staff_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  joining_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leave_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_records(id) ON DELETE CASCADE,
  leave_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', 
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Clear existing dummy data to avoid duplicates (optional but good for clean state)
DELETE FROM leave_records;
DELETE FROM staff_records;

-- 3. Insert Staff Records
INSERT INTO staff_records (id, name, email, role, department, joining_date)
VALUES 
('a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'Arjun Sharma', 'arjun.sharma@example.com', 'Senior Professor', 'Computer Science', '2023-01-15'),
('b2c3d4e5-f6a7-4b6c-9d8e-123456789abc', 'Priya Patel', 'priya.patel@example.com', 'Assistant Professor', 'Mathematics', '2023-03-20'),
('c3d4e5f6-a7b8-4c7d-8e9f-23456789abcd', 'Rohan Gupta', 'rohan.gupta@example.com', 'Lab Instructor', 'Physics', '2022-11-10');

-- 4. Insert Leave Records
INSERT INTO leave_records (id, staff_id, leave_type, start_date, end_date, reason, status)
VALUES 
('d4e5f6a7-b8c9-4d8e-9f0a-3456789abcde', 'a1b2c3d4-e5f6-4a5b-8c9d-0123456789ab', 'Sick Leave', '2024-04-01', '2024-04-03', 'Recovering from viral fever', 'pending'),
('e5f6a7b8-c9d0-4e9f-0a1b-456789abcdef', 'b2c3d4e5-f6a7-4b6c-9d8e-123456789abc', 'Casual Leave', '2024-04-10', '2024-04-11', 'Attending a family wedding', 'approved');
