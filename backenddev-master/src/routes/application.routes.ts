import { Router } from 'express';
import { query } from '../db/postgres.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import {
  validateRequired,
  validateEnum,
  validateUUID
} from '../middleware/validation.middleware.js';
import { ApiResponse, ApplicationRequest } from '../types/index.js';

const router = Router();

// Get applications for a user
router.get('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.query.userId as string;
  const status = req.query.status as string;
  const type = req.query.type as string;

  // If not admin, can only see own applications
  const actualUserId = req.user!.role === 'admin' ? userId : req.user!.id;

  validateRequired(actualUserId, 'User ID');
  validateUUID(actualUserId, 'User ID');

  // Validate status if provided
  if (status) {
    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
    validateEnum(status, validStatuses, 'status filter');
  }

  // Validate type if provided
  if (type) {
    const validTypes = ['leave_request', 'expense_claim', 'training_request', 'equipment_request', 'other'];
    validateEnum(type, validTypes, 'request type filter');
  }

  let whereClause = 'WHERE ar.id IN (SELECT application_id FROM chat_sessions WHERE user_id = $1)';
  const values = [actualUserId];
  let paramCount = 2;

  if (status) {
    whereClause += ` AND ar.status = $${paramCount++}`;
    values.push(status);
  }

  if (type) {
    whereClause += ` AND ar.request_type = $${paramCount++}`;
    values.push(type);
  }

  const result = await query(
    `SELECT ar.*, cs.user_id,
            COALESCE(array_agg(DISTINCT sc.*) FILTER (WHERE sc.id IS NOT NULL), '{}') as timeline,
            COALESCE(array_agg(DISTINCT ad.*) FILTER (WHERE ad.id IS NOT NULL), '{}') as documents
     FROM application_requests ar
     LEFT JOIN chat_sessions cs ON ar.session_id = cs.id
     LEFT JOIN status_changes sc ON ar.id = sc.application_id
     LEFT JOIN application_documents ad ON ar.id = ad.application_id
     ${whereClause}
     GROUP BY ar.id, cs.user_id
     ORDER BY ar.created_at DESC`,
    values
  );

  res.json({
    success: true,
    data: result.rows
  } as ApiResponse<ApplicationRequest[]>);
}));

// Create new application
router.post('/', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { sessionId, requestType, formData } = req.body;

  validateRequired(sessionId, 'Session ID');
  validateRequired(requestType, 'Request type');
  validateUUID(sessionId, 'Session ID');

  // Validate request type
  const validTypes = ['leave_request', 'expense_claim', 'training_request', 'equipment_request', 'other'];
  validateEnum(requestType, validTypes, 'request type');

  // Verify session exists and belongs to user (or user is admin)
  const sessionCheck = await query(
    'SELECT id FROM chat_sessions WHERE id = $1 AND (user_id = $2 OR $3 = $4)',
    [sessionId, req.user!.id, req.user!.role, 'admin']
  );
  if (sessionCheck.rows.length === 0) {
    throw createError('Chat session not found or access denied', 404);
  }

  const result = await query(
    `INSERT INTO application_requests (session_id, request_type, status, form_data)
     VALUES ($1, $2, 'draft', $3)
     RETURNING *`,
    [sessionId, requestType, JSON.stringify(formData || {})]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  } as ApiResponse<ApplicationRequest>);
}));

// Update application
router.patch('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { status, formData, changedBy, comment } = req.body;

  if (typeof id === 'string') {
    validateUUID(id, 'Application ID');
  }

  // Validate status if provided - only reviewers/admins can change status
  if (status) {
    if (req.user!.role === 'applicant') {
      throw createError('Applicants cannot change application status', 403);
    }
    const validStatuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
    validateEnum(status, validStatuses, 'status');
  }

  // Validate changedBy if status is being changed
  if (status && !changedBy) {
    throw createError('changedBy is required when updating status', 400);
  }

  if (changedBy) {
    validateUUID(changedBy, 'Changed by user ID');
    // Ensure changedBy matches current user
    if (changedBy !== req.user!.id) {
      throw createError('changedBy must match the authenticated user', 400);
    }
  }

  const client = await import('../db/postgres.js').then(m => m.getClient());

  try {
    await client.query('BEGIN');

    // Check if application exists and user has access
    const existingApp = await client.query(
      `SELECT ar.id, ar.status, cs.user_id
       FROM application_requests ar
       JOIN chat_sessions cs ON ar.session_id = cs.id
       WHERE ar.id = $1`,
      [id]
    );
    if (existingApp.rows.length === 0) {
      throw createError('Application not found', 404);
    }

    const app = existingApp.rows[0];

    // Check ownership or admin access
    if (req.user!.role !== 'admin' && app.user_id !== req.user!.id) {
      throw createError('Access denied: You can only update your own applications', 403);
    }

    // Update application
    const updateFields = [];
    const values = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (formData !== undefined) {
      updateFields.push(`form_data = $${paramCount++}`);
      values.push(JSON.stringify(formData));
    }

    if (status === 'submitted' && !updateFields.includes('submitted_at = NOW()')) {
      updateFields.push('submitted_at = NOW()');
    }

    if (status === 'approved' || status === 'rejected') {
      updateFields.push('completed_at = NOW()');
    }

    updateFields.push('updated_at = NOW()');

    values.push(id);

    const updateResult = await client.query(
      `UPDATE application_requests
       SET ${updateFields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    // Add status change record
    if (status && changedBy) {
      await client.query(
        `INSERT INTO status_changes (application_id, status, changed_by, comment)
         VALUES ($1, $2, $3, $4)`,
        [id, status, changedBy, comment || null]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      data: updateResult.rows[0]
    } as ApiResponse<ApplicationRequest>);

  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}));

// Get application by ID
router.get('/:id', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  if (typeof id === 'string') {
    validateUUID(id, 'Application ID');
  }

  const result = await query(
    `SELECT ar.*, cs.user_id,
            COALESCE(array_agg(DISTINCT sc.*) FILTER (WHERE sc.id IS NOT NULL), '{}') as timeline,
            COALESCE(array_agg(DISTINCT ad.*) FILTER (WHERE ad.id IS NOT NULL), '{}') as documents
     FROM application_requests ar
     LEFT JOIN chat_sessions cs ON ar.session_id = cs.id
     LEFT JOIN status_changes sc ON ar.id = sc.application_id
     LEFT JOIN application_documents ad ON ar.id = ad.application_id
     WHERE ar.id = $1
     GROUP BY ar.id, cs.user_id`,
    [id]
  );

  if (result.rows.length === 0) {
    throw createError('Application not found', 404);
  }

  const application = result.rows[0];

  // Check ownership or admin access
  if (req.user!.role !== 'admin' && application.user_id !== req.user!.id) {
    throw createError('Access denied: You can only view your own applications', 403);
  }

  res.json({
    success: true,
    data: application
  } as ApiResponse<ApplicationRequest>);
}));

export default router;