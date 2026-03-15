# Chat Application - Complete & Production Ready ✅

A **full-stack AI-powered chat application** with user management, real-time messaging, application workflows, institute management, and admin dashboard.

**Status**: ✅ Fully configured | ✅ Build successful | 🚀 Development server running | 📚 Comprehensive documentation included

---

## 🎯 Quick Start (5 minutes)

### Windows
```batch
setup.bat
npm run dev
```

### macOS/Linux
```bash
./setup.sh
npm run dev
```

**Access at: http://localhost:5173**

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | System design, microservices, data models |
| **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** | All API endpoints with examples |
| **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** | Installation and configuration |
| **[PROJECT_VALIDATION.md](./PROJECT_VALIDATION.md)** | Status and checklist |
| **[CREDENTIALS_REFERENCE.md](./CREDENTIALS_REFERENCE.md)** | Secrets and quick reference |
| **[COMPLETION_SUMMARY.md](./COMPLETION_SUMMARY.md)** | What's completed |

---

## 🏗️ Architecture Overview

This application features a **complete microservices architecture**:

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend API**: Node.js + Express + TypeScript
- **Database**: PostgreSQL 15 + Redis 7
- **Real-time**: Socket.io WebSocket support
- **Security**: JWT authentication + RBAC
- **Files**: AWS S3 integration
- **Email**: SMTP notifications
- **Institute Management**: Student, staff, library, and financial management
- **Infrastructure**: Docker + Docker Compose

## ✨ Features

✅ Real-time chat with WebSocket  
✅ User registration and authentication  
✅ Application request workflows  
✅ Admin dashboard and controls  
✅ File uploads and attachments  
✅ Email notifications  
✅ Role-based access control (RBAC)  
✅ Redis session caching  
✅ Comprehensive error handling  
✅ Full TypeScript type safety  

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- npm 9+
- 2GB RAM minimum

### Development Setup

1. **Clone and install dependencies:**

```bash
# Frontend
npm install

# Backend
cd backenddev-master
npm install
```

2. **Environment Setup:**

Update the `.env` file in the backend directory with your configuration.

3. **Database Setup:**

```bash
# Using Docker Compose (recommended)
docker-compose up -d postgres redis

# Or install PostgreSQL and Redis locally
```

4. **Run Database Migrations:**

```bash
cd backenddev-master
# Run the schema.sql file against your PostgreSQL database
```

5. **Start the Application:**

```bash
# Backend
cd backenddev-master
npm start

# Frontend (in another terminal)
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Health Check: http://localhost:4000/health

### Production Setup

1. **Build and run with Docker:**

```bash
# Build all services
docker-compose build

# Start all services
docker-compose up -d
```

2. **Access the application:**

- Application: http://localhost:5173
- Grafana: http://localhost:3000 (admin/admin)
- Prometheus: http://localhost:9090
- Kibana: http://localhost:5601

## API Documentation

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration

### Chat

- `GET /api/v1/chat/sessions` - Get user chat sessions
- `POST /api/v1/chat/sessions` - Create new chat session
- `GET /api/v1/chat/sessions/:id/messages` - Get session messages
- `POST /api/v1/chat/sessions/:id/messages` - Send message

### Applications

- `GET /api/v1/applications` - Get user applications
- `POST /api/v1/applications` - Create new application
- `PATCH /api/v1/applications/:id` - Update application status

### Users

- `GET /api/v1/users/profile` - Get user profile
- `PATCH /api/v1/users/profile` - Update user profile

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | development |
| `PORT` | Server port | 4000 |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_HOST` | Redis host | 127.0.0.1 |
| `REDIS_PORT` | Redis port | 6379 |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `OPENAI_API_KEY` | OpenAI API key | Optional |
| `ELASTICSEARCH_NODE` | Elasticsearch URL | http://localhost:9200 |

## Development

### Project Structure

```
├── src/                      # React frontend
│   ├── components/           # Reusable UI components
│   ├── pages/               # Page components
│   ├── stores/              # Zustand state management
│   └── types/               # TypeScript definitions
├── backenddev-master/        # Node.js backend
│   ├── src/
│   │   ├── db/              # Database connections
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   └── types/           # TypeScript definitions
├── docker-compose.yml        # Docker services
└── README.md
```

### Available Scripts

#### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

#### Backend
- `npm start` - Start development server with hot reload
- `npm run build` - Build TypeScript
- `npm run serve` - Serve production build

## Security

- End-to-end encryption for sensitive messages
- JWT-based authentication
- Rate limiting and security headers
- Input validation and sanitization
- Audit logging for compliance

## Monitoring

The application includes comprehensive monitoring:

- **Prometheus**: Metrics collection
- **Grafana**: Visualization dashboards
- **Health Checks**: Application health monitoring
- **Logging**: Structured logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
