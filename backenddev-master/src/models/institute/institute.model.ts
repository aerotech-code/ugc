// Complete Institute ERP Models
// File: backenddev-master/src/models/institute/institute.model.ts

import { query } from '../../db/postgres.js';
import { ApiError } from '../../utils/apiError.js';

// ============================================
// ACADEMIC MODELS
// ============================================

export interface AcademicYear {
  id: string;
  year_code: string;
  start_date: Date;
  end_date: Date;
  status: 'pending' | 'ongoing' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface AcademicTerm {
  id: string;
  academic_year_id: string;
  term_name: string;
  term_sequence: number;
  start_date: Date;
  end_date: Date;
  status: 'pending' | 'active' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface Program {
  id: string;
  program_code: string;
  program_name: string;
  program_type: 'Bachelor' | 'Master' | 'Diploma' | 'Certificate';
  duration_years: number;
  department_id: string;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Department {
  id: string;
  dept_code: string;
  dept_name: string;
  head_id: string;
  building_location: string;
  phone: string;
  email: string;
  budget: number;
  created_at: Date;
  updated_at: Date;
}

export interface Course {
  id: string;
  course_code: string;
  course_name: string;
  credits: number;
  department_id: string;
  description: string;
  prerequisite_course_ids: string[];
  is_mandatory: boolean;
  max_students: number;
  created_at: Date;
  updated_at: Date;
}

export interface ClassSection {
  id: string;
  program_id: string;
  academic_year_id: string;
  semester: number;
  section_name: string;
  capacity: number;
  class_advisor_id: string;
  room_id: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// STUDENT MODELS
// ============================================

export interface Student {
  id: string;
  student_code: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: Date;
  gender: string;
  photo_url: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email: string;
  emergency_contact: string;
  enrollment_status: 'active' | 'inactive' | 'graduated' | 'suspended';
  enrollment_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StudentEnrollment {
  id: string;
  student_id: string;
  program_id: string;
  class_section_id: string;
  academic_year_id: string;
  enrollment_status: 'active' | 'inactive' | 'dropped';
  entry_score: number;
  created_at: Date;
  updated_at: Date;
}

export interface StudentAttendance {
  id: string;
  student_id: string;
  course_id: string;
  academic_term_id: string;
  attendance_date: Date;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes: string;
  created_at: Date;
  updated_at: Date;
}

export interface AssessmentMarks {
  id: string;
  student_id: string;
  course_id: string;
  academic_term_id: string;
  assessment_type: 'exam' | 'assignment' | 'practical' | 'project' | 'quiz';
  marks_obtained: number;
  total_marks: number;
  assessment_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StudentGrade {
  id: string;
  student_id: string;
  course_id: string;
  academic_term_id: string;
  grade_point: number;
  grade_letter: string;
  total_marks: number;
  percentage: number;
  grade_status: 'passed' | 'failed' | 'incomplete';
  created_at: Date;
  updated_at: Date;
}

export interface StudentProgress {
  id: string;
  student_id: string;
  academic_year_id: string;
  gpa: number;
  total_credits_earned: number;
  total_credits_registered: number;
  standing: 'good' | 'probation' | 'warning' | 'suspended';
  status_notes: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// FINANCE MODELS
// ============================================

export interface FeeCategory {
  id: string;
  category_code: string;
  category_name: string;
  description: string;
  is_mandatory: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface FeeStructure {
  id: string;
  program_id: string;
  academic_year_id: string;
  fee_category_id: string;
  amount: number;
  due_date: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StudentFee {
  id: string;
  student_id: string;
  academic_year_id: string;
  fee_category_id: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  due_date: Date;
  status: 'pending' | 'partial' | 'paid' | 'overdue';
  created_at: Date;
  updated_at: Date;
}

export interface FeePayment {
  id: string;
  student_fee_id: string;
  payment_amount: number;
  payment_date: Date;
  payment_method: 'cash' | 'cheque' | 'bank_transfer' | 'card';
  reference_number: string;
  receipt_number: string;
  received_by_id: string;
  notes: string;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// LIBRARY MODELS
// ============================================

export interface LibraryBook {
  id: string;
  isbn: string;
  book_code: string;
  title: string;
  author: string;
  publisher: string;
  publication_year: number;
  category_id: string;
  shelf_location: string;
  total_copies: number;
  available_copies: number;
  cost: number;
  created_at: Date;
  updated_at: Date;
}

export interface BookBorrowing {
  id: string;
  book_id: string;
  member_id: string;
  issue_date: Date;
  due_date: Date;
  return_date: Date;
  status: 'borrowed' | 'returned' | 'overdue';
  renewal_count: number;
  fine_amount: number;
  created_at: Date;
  updated_at: Date;
}

// ============================================
// TRANSPORT MODELS
// ============================================

export interface Route {
  id: string;
  route_code: string;
  route_name: string;
  start_point: string;
  end_point: string;
  distance_km: number;
  estimated_duration: number;
  stops: number;
  created_at: Date;
  updated_at: Date;
}

export interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_type: string;
  capacity: number;
  driver_id: string;
  route_id: string;
  purchase_date: Date;
  last_service_date: Date;
  status: 'active' | 'maintenance' | 'retired';
  created_at: Date;
  updated_at: Date;
}

// ============================================
// HOSTEL MODELS
// ============================================

export interface Hostel {
  id: string;
  hostel_name: string;
  hostel_type: 'boys' | 'girls' | 'co-ed';
  location: string;
  total_capacity: number;
  wardens_contact: string;
  created_at: Date;
  updated_at: Date;
}

export interface HostelRoom {
  id: string;
  hostel_id: string;
  room_number: string;
  floor_number: number;
  room_type: 'single' | 'double' | 'triple';
  capacity: number;
  current_occupancy: number;
  status: 'available' | 'full' | 'maintenance';
  created_at: Date;
  updated_at: Date;
}

export interface HostelAllocation {
  id: string;
  student_id: string;
  room_id: string;
  academic_year_id: string;
  checkin_date: Date;
  checkout_date: Date;
  status: 'allocated' | 'active' | 'checkout';
  created_at: Date;
  updated_at: Date;
}

// ============================================
// STAFF & ROLES MODELS
// ============================================

export interface Staff {
  id: string;
  staff_code: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: Date;
  gender: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  joining_date: Date;
  designation: string;
  department_id: string;
  role_id: string;
  salary: number;
  status: 'active' | 'inactive' | 'retired' | 'resigned';
  created_at: Date;
  updated_at: Date;
}

export interface StaffRole {
  id: string;
  role_code: string;
  role_name: string;
  description: string;
  permissions: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Teacher extends Staff {
  qualification: string;
  specialization: string;
  total_experience_years: number;
  courses_assigned: string[];
  office_hours: string;
}

// ============================================
// INSTITUTE SERVICE METHODS
// ============================================

class InstituteService {
  // Academic Years
  async createAcademicYear(data: Partial<AcademicYear>): Promise<AcademicYear> {
    const result = await query(
      `INSERT INTO academic_years (year_code, start_date, end_date, status)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [data.year_code, data.start_date, data.end_date, data.status || 'pending']
    );
    return result.rows[0];
  }

  async getAcademicYears(): Promise<AcademicYear[]> {
    const result = await query('SELECT * FROM academic_years ORDER BY year_code DESC');
    return result.rows;
  }

  async getAcademicYearById(id: string): Promise<AcademicYear> {
    const result = await query('SELECT * FROM academic_years WHERE id = $1', [id]);
    if (result.rows.length === 0) throw new ApiError(404, 'Academic year not found');
    return result.rows[0];
  }

  // Departments
  async createDepartment(data: Partial<Department>): Promise<Department> {
    const result = await query(
      `INSERT INTO departments (dept_code, dept_name, head_id, building_location, phone, email, budget)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.dept_code, data.dept_name, data.head_id, data.building_location, data.phone, data.email, data.budget]
    );
    return result.rows[0];
  }

  async getDepartments(): Promise<Department[]> {
    const result = await query('SELECT * FROM departments ORDER BY dept_name');
    return result.rows;
  }

  // Students
  async createStudent(data: Partial<Student>): Promise<Student> {
    const result = await query(
      `INSERT INTO students (student_code, user_id, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, country, postal_code, guardian_name, guardian_phone, guardian_email, emergency_contact, enrollment_status, enrollment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [data.student_code, data.user_id, data.first_name, data.last_name, data.email, data.phone, data.date_of_birth, data.gender, data.address, data.city, data.state, data.country, data.postal_code, data.guardian_name, data.guardian_phone, data.guardian_email, data.emergency_contact, data.enrollment_status || 'active', data.enrollment_date]
    );
    return result.rows[0];
  }

  async getStudents(limit = 50, offset = 0): Promise<Student[]> {
    const result = await query(
      'SELECT * FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    return result.rows;
  }

  async getStudentByEmail(email: string): Promise<Student> {
    const result = await query('SELECT * FROM students WHERE email = $1', [email]);
    if (result.rows.length === 0) throw new ApiError(404, 'Student not found');
    return result.rows[0];
  }

  async getStudentAttendance(studentId: string, termId: string): Promise<StudentAttendance[]> {
    const result = await query(
      'SELECT * FROM student_attendance WHERE student_id = $1 AND academic_term_id = $2 ORDER BY attendance_date DESC',
      [studentId, termId]
    );
    return result.rows;
  }

  async recordAttendance(data: Partial<StudentAttendance>): Promise<StudentAttendance> {
    const result = await query(
      `INSERT INTO student_attendance (student_id, course_id, academic_term_id, attendance_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [data.student_id, data.course_id, data.academic_term_id, data.attendance_date, data.status, data.notes]
    );
    return result.rows[0];
  }

  async recordAssessmentMarks(data: Partial<AssessmentMarks>): Promise<AssessmentMarks> {
    const result = await query(
      `INSERT INTO assessment_marks (student_id, course_id, academic_term_id, assessment_type, marks_obtained, total_marks, assessment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [data.student_id, data.course_id, data.academic_term_id, data.assessment_type, data.marks_obtained, data.total_marks, data.assessment_date]
    );
    return result.rows[0];
  }

  async getStudentGrades(studentId: string, termId: string): Promise<StudentGrade[]> {
    const result = await query(
      'SELECT * FROM student_grades WHERE student_id = $1 AND academic_term_id = $2 ORDER BY created_at DESC',
      [studentId, termId]
    );
    return result.rows;
  }

  async computeStudentGPA(studentId: string, academicYearId: string): Promise<number> {
    const result = await query(
      `SELECT AVG(CAST(grade_point AS NUMERIC)) as gpa FROM student_grades 
       WHERE student_id = $1 AND academic_term_id IN (
         SELECT id FROM academic_terms WHERE academic_year_id = $2
       )`,
      [studentId, academicYearId]
    );
    return result.rows[0]?.gpa || 0;
  }

  // Fees
  async createFeeStructure(data: Partial<FeeStructure>): Promise<FeeStructure> {
    const result = await query(
      `INSERT INTO fee_structure (program_id, academic_year_id, fee_category_id, amount, due_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [data.program_id, data.academic_year_id, data.fee_category_id, data.amount, data.due_date]
    );
    return result.rows[0];
  }

  async assignStudentFees(studentId: string, academicYearId: string): Promise<void> {
    // Get student's program first
    const studentEnrollment = await query(
      'SELECT program_id FROM student_enrollment WHERE student_id = $1 AND academic_year_id = $2',
      [studentId, academicYearId]
    );

    if (studentEnrollment.rows.length === 0) {
      throw new ApiError(404, 'Student enrollment not found');
    }

    const programId = studentEnrollment.rows[0].program_id;

    // Get fee structure for this program and year
    const feeStructure = await query(
      'SELECT * FROM fee_structure WHERE program_id = $1 AND academic_year_id = $2',
      [programId, academicYearId]
    );

    // Create student fees
    for (const fee of feeStructure.rows) {
      await query(
        `INSERT INTO student_fees (student_id, academic_year_id, fee_category_id, total_amount, outstanding_amount, due_date, status)
         VALUES ($1, $2, $3, $4, $4, $5, $6) RETURNING *`,
        [studentId, academicYearId, fee.fee_category_id, fee.amount, fee.due_date, 'pending']
      );
    }
  }

  async recordFeePayment(data: Partial<FeePayment>): Promise<FeePayment> {
    // Update student fees
    const result = await query(
      `INSERT INTO fee_payments (student_fee_id, payment_amount, payment_date, payment_method, reference_number, receipt_number, received_by_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [data.student_fee_id, data.payment_amount, data.payment_date, data.payment_method, data.reference_number, data.receipt_number, data.received_by_id, data.notes]
    );

    // Update student fee status
    const studentFee = await query('SELECT * FROM student_fees WHERE id = $1', [data.student_fee_id]);
    const newPaidAmount = studentFee.rows[0].paid_amount + data.payment_amount;
    const outstandingAmount = studentFee.rows[0].total_amount - newPaidAmount;
    const newStatus = outstandingAmount <= 0 ? 'paid' : 'partial';

    await query(
      'UPDATE student_fees SET paid_amount = $1, outstanding_amount = $2, status = $3 WHERE id = $4',
      [newPaidAmount, outstandingAmount, newStatus, data.student_fee_id]
    );

    return result.rows[0];
  }

  async getStudentOutstandingFees(studentId: string): Promise<StudentFee[]> {
    const result = await query(
      `SELECT * FROM student_fees WHERE student_id = $1 AND status IN ('pending', 'partial', 'overdue')
       ORDER BY due_date ASC`,
      [studentId]
    );
    return result.rows;
  }

  // Library
  async addBook(data: Partial<LibraryBook>): Promise<LibraryBook> {
    const result = await query(
      `INSERT INTO library_books (isbn, book_code, title, author, publisher, publication_year, category_id, shelf_location, total_copies, available_copies, cost)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10) RETURNING *`,
      [data.isbn, data.book_code, data.title, data.author, data.publisher, data.publication_year, data.category_id, data.shelf_location, data.total_copies, data.cost]
    );
    return result.rows[0];
  }

  async issueBook(bookId: string, memberId: string, daysToReturn = 14): Promise<BookBorrowing> {
    const issueDate = new Date();
    const dueDate = new Date(issueDate.getTime() + daysToReturn * 24 * 60 * 60 * 1000);

    const result = await query(
      `INSERT INTO book_borrowing (book_id, member_id, issue_date, due_date, status, renewal_count)
       VALUES ($1, $2, $3, $4, $5, 0) RETURNING *`,
      [bookId, memberId, issueDate, dueDate, 'borrowed']
    );

    // Decrease available copies
    await query('UPDATE library_books SET available_copies = available_copies - 1 WHERE id = $1', [bookId]);

    return result.rows[0];
  }

  async returnBook(borrowingId: string): Promise<BookBorrowing> {
    const borrowing = await query('SELECT * FROM book_borrowing WHERE id = $1', [borrowingId]);
    if (borrowing.rows.length === 0) throw new ApiError(404, 'Book borrowing record not found');

    const record = borrowing.rows[0];
    const returnDate = new Date();

    // Calculate fine if overdue
    let fineAmount = 0;
    if (returnDate > record.due_date) {
      const daysOverdue = Math.ceil((returnDate.getTime() - record.due_date.getTime()) / (24 * 60 * 60 * 1000));
      fineAmount = daysOverdue * 10; // 10 per day
    }

    const result = await query(
      'UPDATE book_borrowing SET return_date = $1, status = $2, fine_amount = $3 WHERE id = $4 RETURNING *',
      [returnDate, 'returned', fineAmount, borrowingId]
    );

    // Increase available copies
    await query('UPDATE library_books SET available_copies = available_copies + 1 WHERE id = $1', [record.book_id]);

    return result.rows[0];
  }

  // Staff
  async createStaff(data: Partial<Staff>): Promise<Staff> {
    const result = await query(
      `INSERT INTO staff (staff_code, user_id, first_name, last_name, email, phone, date_of_birth, gender, address, city, state, country, postal_code, joining_date, designation, department_id, role_id, salary, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19) RETURNING *`,
      [data.staff_code, data.user_id, data.first_name, data.last_name, data.email, data.phone, data.date_of_birth, data.gender, data.address, data.city, data.state, data.country, data.postal_code, data.joining_date, data.designation, data.department_id, data.role_id, data.salary, data.status || 'active']
    );
    return result.rows[0];
  }

  async getStaffByDepartment(deptId: string): Promise<Staff[]> {
    const result = await query(
      'SELECT * FROM staff WHERE department_id = $1 AND status = $2 ORDER BY last_name',
      [deptId, 'active']
    );
    return result.rows;
  }

  async getTeachers(): Promise<Record<string, unknown>[]> {
    const result = await query(
      `SELECT s.*, t.qualification, t.specialization, t.total_experience_years, t.courses_assigned
       FROM staff s
       JOIN teachers t ON s.id = t.staff_id
       WHERE s.status = $1
       ORDER BY s.last_name`,
      ['active']
    );
    return result.rows;
  }
}

export default new InstituteService();
