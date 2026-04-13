import { Router } from 'express';
import { query } from '../db/postgres.js';
import { asyncHandler, createError } from '../middleware/error.middleware.js';
import { authenticateToken, requireOwnershipOrAdmin, AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { validateRequired, validateUUID } from '../middleware/validation.middleware.js';
import { ApiResponse, ChatSession, Message } from '../types/index.js';

const router = Router();

// Get all chat sessions for a user
router.get('/sessions', authenticateToken, requireOwnershipOrAdmin('userId'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.query.userId as string;

  validateRequired(userId, 'User ID');
  validateUUID(userId, 'User ID');

  const result = await query(
    `SELECT cs.*, u.first_name, u.last_name, u.avatar
     FROM chat_sessions cs
     LEFT JOIN users u ON cs.assigned_agent = u.id
     WHERE cs.user_id = $1
     ORDER BY cs.updated_at DESC`,
    [userId]
  );

  res.json({
    success: true,
    data: result.rows
  } as ApiResponse<ChatSession[]>);
}));

// Create new chat session
router.post('/sessions', asyncHandler(async (req, res) => {
  const { userId, category, priority = 'medium', tags } = req.body;

  if (!userId) {
    throw createError('User ID is required', 400);
  }

  // Validate priority
  const validPriorities = ['low', 'medium', 'high'];
  if (!validPriorities.includes(priority)) {
    throw createError('Invalid priority level', 400);
  }

  const result = await query(
    `INSERT INTO chat_sessions (user_id, status, priority, category, tags)
     VALUES ($1, 'active', $2, $3, $4)
     RETURNING *`,
    [userId, priority, category, tags || []]
  );

  res.status(201).json({
    success: true,
    data: result.rows[0]
  } as ApiResponse<ChatSession>);
}));

// Get messages for a session
router.get('/sessions/:sessionId/messages', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

  const messagesResult = await query(
    `SELECT m.*, array_agg(a.*) as attachments
     FROM messages m
     LEFT JOIN attachments a ON m.id = a.message_id
     WHERE m.session_id = $1
     GROUP BY m.id
     ORDER BY m.timestamp DESC
     LIMIT $2 OFFSET $3`,
    [sessionId, limit, offset]
  );

  const totalResult = await query(
    'SELECT COUNT(*) as total FROM messages WHERE session_id = $1',
    [sessionId]
  );

  const total = parseInt(totalResult.rows[0].total);
  const totalPages = Math.ceil(total / parseInt(limit as string));

  res.json({
    success: true,
    data: messagesResult.rows,
    pagination: {
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      total,
      totalPages
    }
  } as ApiResponse<Message[]>);
}));

// Send message
router.post('/sessions/:sessionId/messages', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { sender, messageType, content, metadata } = req.body;

  if (!sessionId) {
    throw createError('Session ID is required', 400);
  }

  if (!sender || !messageType || !content) {
    throw createError('Sender, message type, and content are required', 400);
  }

  // Validate sender
  const validSenders = ['user', 'agent', 'system', 'bot'];
  if (!validSenders.includes(sender)) {
    throw createError('Invalid sender type', 400);
  }

  // Validate message type
  const validTypes = ['text', 'file', 'form', 'template'];
  if (!validTypes.includes(messageType)) {
    throw createError('Invalid message type', 400);
  }

  // Check if session exists
  const sessionCheck = await query('SELECT id FROM chat_sessions WHERE id = $1', [sessionId]);
  if (sessionCheck.rows.length === 0) {
    throw createError('Chat session not found', 404);
  }

  // Insert message
  const messageResult = await query(
    `INSERT INTO messages (session_id, sender, message_type, content, metadata)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [sessionId, sender, messageType, JSON.stringify(content), JSON.stringify(metadata || {})]
  );

  // Update session updated_at
  await query(
    'UPDATE chat_sessions SET updated_at = NOW() WHERE id = $1',
    [sessionId]
  );

  res.status(201).json({
    success: true,
    data: messageResult.rows[0]
  } as ApiResponse<Message>);
}));

// Update session status
router.patch('/sessions/:sessionId', asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const { status, assignedAgent } = req.body;

  const updateFields = [];
  const values = [];
  let paramCount = 1;

  if (status) {
    updateFields.push(`status = $${paramCount++}`);
    values.push(status);
  }

  if (assignedAgent) {
    updateFields.push(`assigned_agent = $${paramCount++}`);
    values.push(assignedAgent);
  }

  if (updateFields.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No fields to update'
    } as ApiResponse);
  }

  values.push(sessionId);

  const result = await query(
    `UPDATE chat_sessions
     SET ${updateFields.join(', ')}, updated_at = NOW()
     WHERE id = $${paramCount}
     RETURNING *`,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Session not found'
    } as ApiResponse);
  }

  res.json({
    success: true,
    data: result.rows[0]
  } as ApiResponse<ChatSession>);
}));

export default router;