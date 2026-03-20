import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Database
import pool from './db/postgres.js';
import { isRedisConnected } from './db/redis.js';

// Routes
import authRoute from './models/auth/auth.routes.js';
import chatRoutes from './routes/chat.routes.js';
import applicationRoutes from './routes/application.routes.js';
import userRoutes from './routes/user.routes.js';
import instituteRoutes from './routes/institute.routes.js';
import sandboxRoutes from './routes/sandbox.routes.js';
import feesRoutes from './erp/fees/fees.routes.js';
import academicsRoutes from './routes/academics.routes.js';
   


// Middleware
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();
// If .env wasn't loaded because working directory differs, try loading relative to project root
if (!process.env.DATABASE_URL) {
  try {
    const path = await import('path');
    const fs = await import('fs');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const fallbackEnv = path.join(__dirname, '..', '.env');
    if (fs.existsSync(fallbackEnv)) {
      dotenv.config({ path: fallbackEnv });
      console.log('Loaded .env from', fallbackEnv);
    }
  } catch {
    // ignore
  }
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 3000;

// Connection state tracking
let DB_CONNECTED = false;
let REDIS_CONNECTED = false;

// Database connection test
const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ PostgreSQL connected successfully');
    DB_CONNECTED = true;
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ PostgreSQL connection failed:', msg);
    DB_CONNECTED = false;
    return false;
  }
};

// Redis connection test (optional)
const testRedisConnection = async (): Promise<boolean> => {
  try {
    const connected = await isRedisConnected();
    if (connected) {
      console.log('✅ Redis connected successfully');
      REDIS_CONNECTED = true;
      return true;
    } else {
      console.log('⚠️  Redis not available (optional service)');
      REDIS_CONNECTED = false;
      return false;
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Redis connection failed:', msg);
    REDIS_CONNECTED = false;
    return false;
  }
};

// Database schema initialization
const initializeDatabase = async (): Promise<boolean> => {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const { fileURLToPath } = await import('url');

    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);

    const schemaPaths = [
      path.join(__dirname, 'db', 'schema.sql'),
      path.join(__dirname, 'erp', 'fees', 'fees.schema.sql'),
      path.join(__dirname, 'erp', 'academics', 'academics.schema.sql'),
    ];

    for (const schemaPath of schemaPaths) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
      await pool.query(schemaSQL);
    }

    console.log('✅ Database schema initialized successfully');
    return true;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('❌ Database schema initialization failed:', msg);
    return false;
  }
};

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
// apply rate limit to most of the API but skip our notes endpoints which can be chatty
app.use('/api/', (req, res, next) => {
  if (req.path.startsWith('/v1/notes')) {
    // allow unlimited requests to notes during development/demo
    return next();
  }
  return limiter(req, res, next);
});

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Chat Application Backend running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    services: {
      database: DB_CONNECTED ? 'connected' : 'unavailable',
      cache: REDIS_CONNECTED ? 'connected' : 'unavailable',
      websocket: 'ready'
    }
  });
});

// API routes
// Basic API root to help quick checks
app.get('/api/v1', (req, res) => {
  res.json({ success: true, message: 'Chat App API v1', services: { database: DB_CONNECTED ? 'connected' : 'unavailable', cache: REDIS_CONNECTED ? 'connected' : 'unavailable' } });
});
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/chat", chatRoutes);
app.use("/api/v1/applications", applicationRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/fees", feesRoutes);
app.use("/api/academics", academicsRoutes);
// Virtual Sandbox API
app.use('/api/sandbox', sandboxRoutes);
console.log('✅ Sandbox routes registered at /api/sandbox');

// Aeronaut notes API (in-memory demo)
import notesRoutes from './routes/notes.routes.js';
app.use('/api/v1/notes', notesRoutes);
console.log('✅ Notes routes registered at /api/v1/notes');

app.use("/api/institute", instituteRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// WebSocket for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`User ${socket.id} joined session ${sessionId}`);
  });

  socket.on('leave-session', (sessionId) => {
    socket.leave(sessionId);
    console.log(`User ${socket.id} left session ${sessionId}`);
  });

  socket.on('send-message', (data) => {
    // Broadcast to all users in the session
    socket.to(data.sessionId).emit('new-message', data.message);
  });

  socket.on('typing', (data) => {
    socket.to(data.sessionId).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Start server with connection checks
const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testDatabaseConnection();
    let DB_DEGRADED = false;
    if (!dbConnected) {
      console.warn('⚠️  PostgreSQL not available — starting in degraded mode (DB features disabled)');
      DB_DEGRADED = true;
    }

    // Initialize database schema only when DB is available
    if (!DB_DEGRADED) {
      const dbInitialized = await initializeDatabase();
      if (!dbInitialized) {
        console.warn('⚠️  Database initialization failed — continuing in degraded mode');
        DB_DEGRADED = true;
      }
    }

    // Test Redis connection (optional)
    await testRedisConnection();

    // Start the server (routes are attached above; route handlers should handle DB errors)
    server.listen(port, () => {
      console.log(`🚀 Chat Application Backend running on port ${port}`);
      console.log(`📡 WebSocket server ready`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log(`🔗 API Base URL: http://localhost:${port}/api/v1`);
      if (DB_DEGRADED) {
        console.warn('⚠️  Server running in degraded mode: database features are disabled or limited');
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
    pool.end(() => {
      console.log('✅ Database pool closed');
      process.exit(0);
    });
  });
});

// Start the server
startServer();




