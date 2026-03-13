// Institute ERP Routes - Simplified for testing
// File: backenddev-master/src/routes/institute.routes.ts

import { Router, Request, Response } from 'express';
import InstituteService from '../models/institute/institute.model.js';

const router = Router();

// Note: Authentication/Authorization can be added later
// For testing phase, routes are open to allow API testing

// ============================================
// ACADEMIC YEAR ROUTES
// ============================================

// Get all academic years
router.get('/academic-years', async (req: Request, res: Response) => {
  try {
    const years = await InstituteService.getAcademicYears();
    res.status(200).json({ success: true, data: years });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get academic year by ID
router.get('/academic-years/:id', async (req: Request, res: Response) => {
  try {
    const year = await InstituteService.getAcademicYearById(req.params.id as string);
    res.status(200).json({ success: true, data: year });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Create academic year
router.post('/academic-years', async (req: Request, res: Response) => {
  try {
    const year = await InstituteService.createAcademicYear({
      ...req.body,
      start_date: new Date(req.body.start_date),
      end_date: new Date(req.body.end_date)
    });
    res.status(201).json({ success: true, data: year });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// ============================================
// DEPARTMENT ROUTES
// ============================================

// Get all departments
router.get('/departments', async (req: Request, res: Response) => {
  try {
    const departments = await InstituteService.getDepartments();
    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Create department
router.post('/departments', async (req: Request, res: Response) => {
  try {
    const department = await InstituteService.createDepartment(req.body);
    res.status(201).json({ success: true, data: department });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// ============================================
// STUDENT ROUTES
// ============================================

// Get all students
router.get('/students', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const students = await InstituteService.getStudents(limit, offset);
    res.status(200).json({ success: true, data: students, limit, offset });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get student by email
router.get('/students/email/:email', async (req: Request, res: Response) => {
  try {
    const student = await InstituteService.getStudentByEmail(req.params.email as string);
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Create student
router.post('/students', async (req: Request, res: Response) => {
  try {
    const student = await InstituteService.createStudent({
      ...req.body,
      date_of_birth: new Date(req.body.date_of_birth),
      enrollment_date: new Date()
    });
    res.status(201).json({ success: true, data: student });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get student attendance
router.get('/students/:id/attendance/:term', async (req: Request, res: Response) => {
  try {
    const attendance = await InstituteService.getStudentAttendance(req.params.id as string, req.params.term as string);
    res.status(200).json({ success: true, data: attendance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Record attendance
router.post('/students/:id/attendance', async (req: Request, res: Response) => {
  try {
    const attendance = await InstituteService.recordAttendance({
      ...req.body,
      student_id: req.params.id,
      attendance_date: new Date()
    });
    res.status(201).json({ success: true, data: attendance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get student grades
router.get('/students/:id/grades/:term', async (req: Request, res: Response) => {
  try {
    const grades = await InstituteService.getStudentGrades(req.params.id as string, req.params.term as string);
    res.status(200).json({ success: true, data: grades });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Record assessment marks
router.post('/students/:id/marks', async (req: Request, res: Response) => {
  try {
    const marks = await InstituteService.recordAssessmentMarks({
      ...req.body,
      student_id: req.params.id,
      assessment_date: new Date()
    });
    res.status(201).json({ success: true, data: marks });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// ============================================
// FEE MANAGEMENT ROUTES
// ============================================

// Create fee structure
router.post('/fee-structures', async (req: Request, res: Response) => {
  try {
    const structure = await InstituteService.createFeeStructure({
      ...req.body,
      due_date: new Date(req.body.due_date)
    });
    res.status(201).json({ success: true, data: structure });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Assign student fees
router.post('/students/:id/assign-fees', async (req: Request, res: Response) => {
  try {
    await InstituteService.assignStudentFees(req.params.id as string, req.body.academic_year_id);
    res.status(201).json({ success: true, message: 'Fees assigned successfully' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Record fee payment
router.post('/fee-payments', async (req: Request, res: Response) => {
  try {
    const payment = await InstituteService.recordFeePayment({
      ...req.body,
      payment_date: new Date(),
      receipt_number: `REC-${Date.now()}`,
      received_by_id: (req as unknown as Record<string, unknown>).user as string
    });
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get student outstanding fees
router.get('/students/:id/outstanding-fees', async (req: Request, res: Response) => {
  try {
    const fees = await InstituteService.getStudentOutstandingFees(req.params.id as string);
    res.status(200).json({ success: true, data: fees });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// ============================================
// LIBRARY ROUTES
// ============================================

// Add book
router.post('/library/books', async (req: Request, res: Response) => {
  try {
    const book = await InstituteService.addBook(req.body);
    res.status(201).json({ success: true, data: book });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Issue book
router.post('/library/issue', async (req: Request, res: Response) => {
  try {
    const borrowing = await InstituteService.issueBook(req.body.book_id, req.body.member_id);
    res.status(201).json({ success: true, data: borrowing });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Return book
router.post('/library/return/:id', async (req: Request, res: Response) => {
  try {
    const borrowing = await InstituteService.returnBook(req.params.id as string);
    res.status(200).json({ success: true, data: borrowing });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// ============================================
// STAFF ROUTES
// ============================================

// Create staff
router.post('/staff', async (req: Request, res: Response) => {
  try {
    const staff = await InstituteService.createStaff({
      ...req.body,
      joining_date: new Date(req.body.joining_date),
      date_of_birth: new Date(req.body.date_of_birth)
    });
    res.status(201).json({ success: true, data: staff });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get staff by department
router.get('/staff/department/:id', async (req: Request, res: Response) => {
  try {
    const staff = await InstituteService.getStaffByDepartment(req.params.id as string);
    res.status(200).json({ success: true, data: staff });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// Get all teachers
router.get('/teachers', async (req: Request, res: Response) => {
  try {
    const teachers = await InstituteService.getTeachers();
    res.status(200).json({ success: true, data: teachers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
});

// ============================================
// HOSTEL ROUTES
// ============================================

router.post('/hostels', async (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Hostel created' });
});

router.get('/hostels', async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: [] });
});

// ============================================
// TRANSPORT ROUTES
// ============================================

router.post('/routes', async (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'Route created' });
});

router.get('/routes', async (req: Request, res: Response) => {
  res.status(200).json({ success: true, data: [] });
});

export default router;

