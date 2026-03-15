// Socket.IO event handlers for chat functionality
import { Server, Socket } from 'socket.io';
import { query } from '../db/postgres.js';
import { cacheService } from '../services/cache.service.js';
import { logger } from '../utils/logger.js';

export const setupChatHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`New client connected: ${socket.id}`);

    // Join a chat session
    socket.on('join_session', async (data: { sessionId: string; userId: string }) => {
      try {
        const { sessionId, userId } = data;
        socket.join(sessionId);

        // Cache user's presence
        await cacheService.set(`session:${sessionId}:user:${userId}`, { socketId: socket.id }, { ttl: 3600 });

        // Notify others
        io.to(sessionId).emit('user_joined', {
          userId,
          message: `User ${userId} joined the chat`,
          timestamp: new Date(),
        });

        logger.info(`User ${userId} joined session ${sessionId}`);
      } catch (error) {
        logger.error('Error joining session', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Handle incoming message
    socket.on('send_message', async (data: { sessionId: string; userId: string; content: string; type: string }) => {
      try {
        const { sessionId, userId, content, type } = data;

        // Save message to database
        const result = await query(
          `INSERT INTO messages (session_id, sender, message_type, content, metadata)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [sessionId, 'user', type, JSON.stringify({ text: content }), JSON.stringify({ userId })]
        );

        const message = result.rows[0];

        // Broadcast to all users in session
        io.to(sessionId).emit('message_received', {
          id: message.id,
          sessionId,
          userId,
          content,
          type,
          timestamp: message.timestamp,
        });

        logger.info(`Message sent in session ${sessionId} by user ${userId}`);
      } catch (error) {
        logger.error('Error sending message', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicator
    socket.on('typing', async (data: { sessionId: string; userId: string; isTyping: boolean }) => {
      try {
        const { sessionId, userId, isTyping } = data;

        io.to(sessionId).emit('user_typing', {
          userId,
          isTyping,
        });

        logger.debug(`User ${userId} typing status: ${isTyping}`);
      } catch (error) {
        logger.error('Error handling typing', error);
      }
    });

    // Leave session
    socket.on('leave_session', async (data: { sessionId: string; userId: string }) => {
      try {
        const { sessionId, userId } = data;
        socket.leave(sessionId);

        // Remove from cache
        await cacheService.delete(`session:${sessionId}:user:${userId}`);

        // Notify others
        io.to(sessionId).emit('user_left', {
          userId,
          message: `User ${userId} left the chat`,
          timestamp: new Date(),
        });

        logger.info(`User ${userId} left session ${sessionId}`);
      } catch (error) {
        logger.error('Error leaving session', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};
