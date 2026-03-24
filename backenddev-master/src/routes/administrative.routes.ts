import { Router, Request, Response } from 'express';
import { asyncHandler } from '../middleware/error.middleware.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validateRequired, validateUUID } from '../middleware/validation.middleware.js';
import { HelpDeskModel } from '../erp/administrative/help-desk/help-desk.model.js';
import { StudentAdmissionModel } from '../erp/administrative/student-admission/student-admission.model.js';
import { ApiError } from '../utils/apiError.js';

const router = Router();

router.use(authenticateToken);

// ==================== HELP DESK TICKETS ====================

router.get('/help-desk/tickets', asyncHandler(async (req: Request, res: Response) => {
  const tickets = await HelpDeskModel.getAllTickets();
  res.status(200).json(tickets);
}));

router.get('/help-desk/tickets/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Ticket ID');

  const ticket = await HelpDeskModel.getTicketById(id);
  res.status(200).json(ticket);
}));

router.post('/help-desk/tickets', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { raised_by, category, subject, description, priority } = req.body;
  validateRequired(raised_by, 'Raised By');
  validateUUID(raised_by, 'Raised By');
  validateRequired(category, 'Category');
  validateRequired(subject, 'Subject');
  validateRequired(description, 'Description');
  validateRequired(priority, 'Priority');

  if (!['low', 'medium', 'high'].includes(priority)) {
    throw new ApiError(400, 'Invalid priority level');
  }

  const ticket = await HelpDeskModel.createTicket({
    raised_by,
    category,
    subject,
    description,
    priority
  });
  
  res.status(200).json(ticket);
}));

router.patch('/help-desk/tickets/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Ticket ID');
  
  const updates = req.body;
  
  if (updates.priority && !['low', 'medium', 'high'].includes(updates.priority)) {
    throw new ApiError(400, 'Invalid priority level');
  }
  if (updates.status && !['open', 'in_progress', 'resolved', 'closed'].includes(updates.status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const updatedTicket = await HelpDeskModel.updateTicketStatus(id, updates);
  res.status(200).json(updatedTicket);
}));

// ==================== STUDENT ADMISSIONS ====================

router.get('/student-admission', asyncHandler(async (req: Request, res: Response) => {
  const admissions = await StudentAdmissionModel.getAllAdmissions();
  res.status(200).json(admissions);
}));

router.get('/student-admission/:id', asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Admission ID');

  const admission = await StudentAdmissionModel.getAdmissionById(id);
  res.status(200).json(admission);
}));

router.post('/student-admission', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { student_name, dob, email, course, academic_year, documents } = req.body;
  validateRequired(student_name, 'Student Name');
  validateRequired(dob, 'Date of Birth');
  validateRequired(email, 'Email');
  validateRequired(course, 'Course');
  validateRequired(academic_year, 'Academic Year');

  const admission = await StudentAdmissionModel.createAdmission({
    student_name,
    dob,
    email,
    course,
    academic_year,
    documents
  });
  
  res.status(200).json(admission);
}));

router.put('/student-admission/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Admission ID');
  
  const updates = req.body;
  if (updates.status && !['pending', 'admitted', 'rejected'].includes(updates.status)) {
    throw new ApiError(400, 'Invalid status');
  }

  const updatedAdmission = await StudentAdmissionModel.updateAdmission(id, updates);
  res.status(200).json(updatedAdmission);
}));

router.delete('/student-admission/:id', asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params as { id: string };
  validateUUID(id, 'Admission ID');

  await StudentAdmissionModel.deleteAdmission(id);
  res.status(200).json({ status: 'success', message: 'Admission record deleted successfully' });
}));

export default router;
