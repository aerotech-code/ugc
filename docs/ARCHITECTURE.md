# Comprehensive Architecture & Setup Documentation

## Project Overview

This is a full-stack chat application with AI/ML capabilities built with:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js/Express + TypeScript
- **Database**: PostgreSQL + Redis
- **Real-time**: Socket.io
- **Infrastructure**: Docker & Docker Compose

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Web App    │  │  Mobile App  │  │  Third-party Integr  │  │
│  │  (React/TS)  │  │  (Optional)  │  │  (Slack/Teams)       │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         └──────────────────┴────────────────────┘              │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                      ┌──────▼──────┐
                      │   CDN/WAF   │
                      │ (Optional)  │
                      └──────┬──────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                   API GATEWAY LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Rate Limiting│  │   Auth/JWT   │  │  CORS & Validation   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                  MICROSERVICES LAYER                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │           Chat Service (WebSocket/HTTP)                 │  │
│  │  - Session Management                                   │  │
│  │  - Message Handling                                     │  │
│  │  - Presence Tracking                                    │  │
│  │  - Typing Indicators                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │      Application Processing Service                     │  │
│  │  - Form Extraction                                      │  │
│  │  - Document Processing                                  │  │
│  │  - Status Tracking                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         User & Admin Service                            │  │
│  │  - Profile Management                                   │  │
│  │  - Role & Permissions                                   │  │
│  │  - Admin Dashboard                                      │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         Notification Service                            │  │
│  │  - Email Notifications                                  │  │
│  │  - Push Notifications                                   │  │
│  │  - In-app Alerts                                        │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│                     DATA LAYER                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  PostgreSQL  │  │    Redis     │  │  S3/File Storage    │  │
│  │ (Primary DB) │  │  (Cache/     │  │  (Attachments)      │  │
│  │              │  │  Sessions)   │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
project/
├── backenddev-master/              # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── index.ts            # Configuration management
│   │   ├── db/
│   │   │   ├── postgres.ts         # PostgreSQL connection
│   │   │   ├── redis.ts            # Redis connection
│   │   │   └── schema.sql          # Database schema
│   │   ├── handlers/
│   │   │   └── chat.handlers.ts    # Socket.io handlers
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts  # JWT authentication
│   │   │   ├── error.middleware.ts # Error handling
│   │   │   └── validation.middleware.ts # Input validation
│   │   ├── models/                 # Data models
│   │   ├── routes/
│   │   │   ├── chat.routes.ts      # Chat endpoints
│   │   │   ├── user.routes.ts      # User management
│   │   │   └── application.routes.ts # Application workflows
│   │   ├── services/
│   │   │   ├── email.service.ts    # Email notifications
│   │   │   ├── cache.service.ts    # Caching logic
│   │   │   └── file.service.ts     # File uploads
│   │   ├── types/
│   │   │   └── index.ts            # TypeScript interfaces
│   │   ├── utils/
│   │   │   ├── apiError.ts         # Error handling
│   │   │   ├── jwt.ts              # JWT utilities
│   │   │   └── logger.ts           # Logging utility
│   │   ├── app.ts                  # Express app setup
│   │   └── server.ts               # Server entry point
│   ├── .env                         # Environment variables
│   ├── .env.example                 # Environment template
│   ├── docker-compose.yml           # Docker services
│   ├── Dockerfile                   # Backend image
│   ├── package.json                 # Dependencies
│   └── tsconfig.json                # TypeScript config
│
├── src/                             # Frontend (React)
│   ├── components/
│   │   ├── layout/
│   │   └── ui/
│   ├── pages/
│   ├── stores/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   └── App.tsx
│
├── .env                             # Frontend env
├── .env.example                     # Frontend env template
├── package.json                     # Frontend dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
└── docker-compose.yml               # Root docker compose
```

---

## Database Schema

### Users Table
- Store user accounts, roles, and profiles
- Roles: `applicant`, `reviewer`, `admin`
- Fields: id, email, password_hash, role, profile info, timestamps

### Chat Sessions Table
- Manage chat conversations between users and agents
- Status: `active`, `closed`, `waiting`
- Links to users and optional applications

### Messages Table
- Store all chat messages
- Types: `text`, `file`, `form`, `template`
- Contains content, metadata, and timestamps

### Application Requests Table
- Track applications and requests
- Status: `draft`, `submitted`, `under_review`, `approved`, `rejected`
- Stores form data and related documents

### Attachments & Documents
- File metadata and URLs
- Links to messages and applications

---

## Environment Configuration

### Backend (.env)
```
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5433/chatapp
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=<your-secret-key>
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=<your-refresh-secret>
REFRESH_TOKEN_EXPIRE=30d

# Email (Nodemailer)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=chatapp-uploads
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
VITE_ENV=development
```

---

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout user

### Chat Routes
- `GET /api/chat/sessions` - Get user's sessions
- `GET /api/chat/sessions/:sessionId` - Get session details
- `POST /api/chat/sessions` - Create new session
- `GET /api/chat/messages/:sessionId` - Get messages in session
- `POST /api/chat/messages` - Send message

### Application Routes
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create application
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/submit` - Submit application
- `GET /api/applications/admin/pending` - Get pending (admin only)

### User Routes
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/:userId` - Update profile
- `GET /api/users` - List all users (admin only)
- `PUT /api/users/:userId/role` - Update user role (admin only)

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd <project-dir>
```

2. **Install dependencies**
```bash
# Frontend
npm install

# Backend
cd backenddev-master
npm install
```

3. **Setup environment variables**
```bash
# Backend
cp .env.example .env
# Edit .env with your configuration

# Frontend
cd ..
cp .env.example .env
```

4. **Start Docker services**
```bash
docker-compose up -d
```

5. **Initialize database**
```bash
# Backend container will auto-run migrations on startup
# Or manually:
docker exec chatapp-postgres psql -U postgres -d chatapp -f /docker-entrypoint-initdb.d/schema.sql
```

6. **Start development servers**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
cd backenddev-master
npm run start
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- API Docs: http://localhost:4000/api-docs (if Swagger is configured)

---

## Key Features

### Chat System
- Real-time messaging via WebSocket
- User presence tracking
- Typing indicators
- Message history
- File attachments

### Application Management
- Multi-step form support
- Document uploads
- Status tracking
- Admin review workflow
- Email notifications

### User Management
- Role-based access control
- User profiles
- Admin dashboard
- Activity logging

### Security
- JWT authentication
- Password hashing (bcrypt)
- Input validation
- CORS protection
- Rate limiting
- Helmet headers

---

## Deployment

### Docker Deployment

1. **Build images**
```bash
docker-compose build
```

2. **Deploy**
```bash
docker-compose -f docker-compose.yml up -d
```

3. **Environment Setup**
   - Update `.env` files for production
   - Set strong JWT secrets
   - Configure SSL/TLS
   - Enable HTTPS

### Production Checklist
- [ ] Update JWT secrets
- [ ] Configure CORS for production domain
- [ ] Setup email service credentials
- [ ] Configure AWS S3 bucket
- [ ] Enable HTTPS/SSL
- [ ] Setup monitoring & logging
- [ ] Configure database backups
- [ ] Setup rate limiting
- [ ] Enable CSRF protection
- [ ] Review security headers

---

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL connection
docker exec chatapp-postgres pg_isready

# Check Redis connection
docker exec chatapp-redis redis-cli ping
```

### Port Already in Use
```bash
# Change ports in docker-compose.yml or kill existing processes
# Windows: netstat -ano | findstr :PORT_NUMBER
# macOS/Linux: lsof -i :PORT_NUMBER
```

### Environment Variables Not Loading
```bash
# Ensure .env file is in the correct directory
# Backend: backenddev-master/.env
# Frontend: .env (root)

# Restart the servers after updating .env
```

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Redis Documentation](https://redis.io/documentation)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Docker Documentation](https://docs.docker.com)

---

## Support & Contribution

For issues, questions, or contributions, please:
1. Check existing documentation
2. Review troubleshooting section
3. Submit issues with detailed information
4. Follow coding standards
5. Write tests for new features

---

**Last Updated**: February 2026
