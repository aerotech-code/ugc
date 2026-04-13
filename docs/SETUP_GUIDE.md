# Project Setup & Configuration Guide

## ✅ STATUS: Development Server Running

**Development Server**: http://localhost:5173 (ACTIVE)  
**Backend API**: http://localhost:4000 (Ready to start)  
**Build Status**: ✅ Successful (No errors)

---

## Prerequisites Check

Before starting, ensure you have:

### System Requirements
- [x] Windows 10/11, macOS 10.15+, or Linux
- [x] Node.js 18+ (check with `node -v`)
- [x] npm 9+ (check with `npm -v`)
- [x] Docker Desktop (optional, for containerization)
- [x] Docker Compose (optional)
- [x] Git (for version control)

### Verify Installation
```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check Docker (optional)
docker --version
docker-compose --version
```

---

## Step 1: Clone & Install

```bash
# Navigate to project directory
cd i:/app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backenddev-master
npm install

# Return to root
cd ..
```

---

## Step 2: Configure Environment Variables

### Backend Configuration
```bash
# Navigate to backend directory
cd backenddev-master

# Copy example env file
cp .env.example .env

# Edit .env file with your settings
# Key values to update:
# - JWT_SECRET: Generate a random string (min 32 chars)
# - SMTP credentials for email notifications
# - AWS S3 credentials if using file uploads
# - Database URL (will auto-connect to Docker PostgreSQL)
```

### Generate JWT Secrets
```bash
# Option 1: Use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Use OpenSSL
openssl rand -hex 32
```

### Frontend Configuration
```bash
# From root directory
cp .env.example .env

# Verify settings match backend URL:
# VITE_API_BASE_URL=http://localhost:4000/api
# VITE_WS_URL=ws://localhost:4000
```

---

## Step 3: Start Docker Services

```bash
# From backend directory
cd backenddev-master

# Build and start all services
docker-compose up -d

# Wait for services to be healthy (30-60 seconds)
# Check status:
docker-compose ps

# If you need to rebuild (after code changes):
docker-compose up -d --build

# View logs:
docker-compose logs -f backend

# Stop and remove containers:
docker-compose down
```

### Alternative: Run Backend Locally (Faster Development)

If Docker is slow or you want to test quickly, run the backend with npm instead:

```bash
# From backenddev-master directory
npm run build
npm run serve

# Or use auto-reload on code changes:
npm start
```

The backend will start at `http://localhost:4000`

### Verify Services
```bash
# Check PostgreSQL
docker exec chatapp-postgres pg_isready

# Check Redis
docker exec chatapp-redis redis-cli ping

# Check Backend
curl http://localhost:4000/health

# Test Sandbox Execute
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"hello\")","language":"python"}'

# Expected response:
# {"success":true,"data":{"output":"hello\n","error":"","executionTime":...}}
```

---

## Step 4: Initialize Database

```bash
# The schema will auto-load from Docker initialization
# But you can manually verify:
docker exec -it chatapp-postgres psql -U postgres -d chatapp -c "
  SELECT table_name FROM information_schema.tables 
  WHERE table_schema='public'
"

# Expected tables:
# - users
# - chat_sessions
# - messages
# - attachments
# - application_requests
# - application_documents
# - status_changes
```

---

## Step 5: Start Development Servers

### Terminal 1: Start Frontend
```bash
# From project root



# Frontend will be available at http://localhost:5173
```

### Terminal 2: Start Backend (if not using Docker)
```bash
# From backenddev-master directory
npm run start

# Backend API will be available at http://localhost:4000
```

### Terminal 3: View Logs (Optional)
```bash
# From backenddev-master directory
docker-compose logs -f
```

---

## Step 6: Create Test User (Optional)

### Via API
```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "firstName": "Test",
    "lastName": "User",
    "role": "applicant"
  }'

# Response will include a JWT token
```

### Via Database
```bash
# Connect to PostgreSQL
docker exec -it chatapp-postgres psql -U postgres -d chatapp

# Insert test user (password: Test@123456 hashed)
INSERT INTO users (email, password_hash, role, first_name, last_name, is_active)
VALUES ('test@example.com', '$2a$10$...', 'applicant', 'Test', 'User', true);

# Exit psql
\q
```

---

## Verification Checklist

- [ ] Frontend running at http://localhost:5173
- [ ] Backend API running at http://localhost:4000
- [ ] PostgreSQL connected (port 5433)
- [ ] Redis connected (port 6379)
- [ ] Database tables created
- [ ] JWT secrets configured
- [ ] Email service configured (optional)
- [ ] CORS settings correct
- [ ] WebSocket connection working

---

## Virtual Sandbox Configuration

The Virtual Sandbox API allows running code in 8 different languages with full execution support.

### Supported Languages

| Language | Status | Requirements |
|----------|--------|--------------|
| **Python** | ✅ Works | Installed by default |
| **JavaScript** | ✅ Works | Node.js (included) |
| **TypeScript** | ✅ Works | Transpiled to JS automatically |
| **Java** | ✅ Works | JDK 17+ (Docker: included, Windows: install separately) |
| **C++** | ✅ Works | G++ (Docker: included, Windows: install MinGW) |
| **C** | ✅ Works | GCC (Docker: included, Windows: install MinGW) |
| **Rust** | ✅ Works | Rustc (Docker: included, Windows: install Rust) |
| **Go** | ✅ Works | Go CLI (Docker: included, Windows: install Go) |

### Local Development (npm start)

Works on Windows/macOS/Linux for **Python, JavaScript, TypeScript, and Java** without additional setup.

Compiled languages (C++, C, Rust, Go) require installing compilers on your system.

### Docker Deployment

All 8 languages work out-of-the-box in Docker since the Dockerfile installs all required runtimes.

```bash
cd backenddev-master
docker-compose up -d --build
```

### Example API Usage

**Python:**
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello Python\")","language":"python"}'
```

**JavaScript:**
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"console.log(\"Hello JS\")","language":"javascript"}'
```

**TypeScript:**
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"const x: number = 42; console.log(x);","language":"typescript"}'
```

**Java:**
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"public class Test { public static void main(String[] args) { System.out.println(\"Hello Java\"); } }","language":"java"}'
```

**C++** (requires Docker or compiler installed):
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"#include <iostream>\nint main() { std::cout << \"Hello C++\" << std::endl; return 0; }","language":"cpp"}'
```

**C** (requires Docker or compiler installed):
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"#include <stdio.h>\nint main() { printf(\"Hello C\\\\n\"); return 0; }","language":"c"}'
```

**Rust** (requires Docker or compiler installed):
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"fn main() { println!(\"Hello Rust\"); }","language":"rust"}'
```

**Go** (requires Docker or compiler installed):
```bash
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"package main\nimport \"fmt\"\nfunc main() { fmt.Println(\"Hello Go\") }","language":"go"}'
```

### Frontend Integration

In the Virtual Sandbox page (http://localhost:5173/sandbox):
- Select your programming language from the dropdown
- Write your code in the editor
- Click "Run Code" to execute it
- Output appears in real-time in the terminal panel

---

## Common Issues & Solutions

### Issue: Port Already in Use

**Error**: `bind: An attempt was made to reuse a socket that is not yet available`

**Solution**:
```bash
# Find and kill process using port
# Windows:
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -i :4000
kill -9 <PID>

# Or change port in docker-compose.yml or .env
```

### Issue: Database Connection Failed

**Error**: `could not connect to server: Connection refused`

**Solution**:
```bash
# Wait for PostgreSQL to start
docker-compose ps

# Check logs
docker-compose logs postgres

# Restart service
docker-compose restart postgres

# Verify connection string in .env
# Should be: postgresql://postgres:password@localhost:5433/chatapp
```

### Issue: Redis Connection Failed

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:6379`

**Solution**:
```bash
# Restart Redis
docker-compose restart redis

# Test connection
docker exec chatapp-redis redis-cli ping

# Check .env settings:
# REDIS_HOST=localhost
# REDIS_PORT=6379
```

### Issue: API Responding with 404 or HTML Error Page

**Error**: `<!DOCTYPE html>...Cannot POST /api/sandbox/execute`

**Cause**: Backend routes not loaded or old cached code running

**Solution**:
```bash
# 1. If using npm start:
#   Kill process and rebuild
cd backenddev-master
npm run build
npm start

# 2. If using Docker:
#   Force full rebuild
docker-compose down
docker-compose up -d --build
docker-compose logs -f backend

# 3. Verify route is registered:
curl http://localhost:4000/api/v1
# Should respond with JSON, not 404

# 4. Test sandbox endpoint directly:
curl -X POST http://localhost:4000/api/sandbox/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"test\")","language":"python"}'
```

### Issue: Frontend Cannot Connect to Backend API

**Error in Browser DevTools**: "SyntaxError: Unexpected token '<', "<!DOCTYPE"... is not valid JSON"

**Cause**: Frontend pointing to wrong API URL or backend not responding properly

**Solution**:
```bash
# 1. Check .env file in root:
grep VITE_API_BASE_URL .env
# Should be: VITE_API_BASE_URL=http://localhost:4000/api

# 2. Verify backend is accessible:
curl http://localhost:4000/health

# 3. Check CORS is enabled (should see Access-Control headers):
curl -i http://localhost:4000/health | grep -i "access-control"

# 4. If CORS fails, check docker-compose environment:
# FRONTEND_URL=http://localhost:5173
# CORS_ORIGIN=http://localhost:5173
```



### Issue: Module Not Found

**Error**: `Cannot find module '@/...'`

**Solution**:
```bash
# Reinstall dependencies
npm install

# Clear cache
npm cache clean --force

# Reinstall
npm install

# Rebuild TypeScript
npm run build
```

---

## Configuration Files Overview

### Key Configuration Files

#### Backend
- **`.env`** - Environment variables
- **`src/config/index.ts`** - Centralized configuration
- **`tsconfig.json`** - TypeScript settings
- **`docker-compose.yml`** - Docker services

#### Frontend
- **`.env`** - Frontend environment variables
- **`vite.config.ts`** - Vite build config
- **`tsconfig.json`** - TypeScript settings
- **`tailwind.config.js`** - Tailwind CSS config

---

## Database Schema

The following tables are automatically created on startup:

### Users
```sql
- id (UUID)
- email (VARCHAR, unique)
- password_hash (VARCHAR)
- role (VARCHAR: applicant|reviewer|admin)
- first_name, last_name (VARCHAR)
- avatar, department, position (VARCHAR)
- is_active (BOOLEAN)
- created_at, updated_at (TIMESTAMP)
```

### Chat Sessions
```sql
- id (UUID)
- user_id (UUID, FK to users)
- application_id (UUID)
- status (VARCHAR: active|closed|waiting)
- assigned_agent (UUID, FK to users)
- category, tags (VARCHAR)
- created_at, updated_at (TIMESTAMP)
```

### Messages
```sql
- id (UUID)
- session_id (UUID, FK to chat_sessions)
- sender (VARCHAR: user|agent|system|bot)
- message_type (VARCHAR: text|file|form|template)
- content (JSONB)
- metadata (JSONB)
- timestamp (TIMESTAMP)
- read_by (VARCHAR)
```

### Applications
```sql
- id (UUID)
- session_id (UUID, FK to chat_sessions)
- request_type (VARCHAR)
- status (VARCHAR: draft|submitted|under_review|approved|rejected)
- form_data (JSONB)
- submitted_at, completed_at (TIMESTAMP)
- created_at, updated_at (TIMESTAMP)
```

---

## Testing the Setup

### Test Frontend
```bash
# Open browser and navigate to:
# http://localhost:5173

# Try:
# 1. Register new account
# 2. Login with credentials
# 3. Create chat session
# 4. Send message
# 5. Check WebSocket connection in DevTools
```

### Test Backend API
```bash
# Use Postman, curl, or insomnia

# 1. Register user
POST http://localhost:4000/api/auth/register

# 2. Login
POST http://localhost:4000/api/auth/login

# 3. Get profile
GET http://localhost:4000/api/users/{userId}
Authorization: Bearer {token}

# 4. Create chat session
POST http://localhost:4000/api/chat/sessions
Authorization: Bearer {token}
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update JWT_SECRET with strong random value
- [ ] Update REFRESH_TOKEN_SECRET
- [ ] Configure production database URL
- [ ] Configure production Redis URL
- [ ] Update FRONTEND_URL and CORS_ORIGIN
- [ ] Setup email service credentials
- [ ] Configure AWS S3 (if using file uploads)
- [ ] Enable HTTPS/SSL
- [ ] Setup domain name
- [ ] Configure backups
- [ ] Setup monitoring
- [ ] Review security settings

### Environment Configuration for Production
```bash
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://yourapp.com
CORS_ORIGIN=https://yourapp.com

# Strong JWT secrets
JWT_SECRET=<generate-strong-random-string>
REFRESH_TOKEN_SECRET=<generate-strong-random-string>

# Production database
DATABASE_URL=postgresql://user:strong-password@db-host:5432/chatapp

# Production Redis
REDIS_HOST=redis-host
REDIS_PORT=6379
REDIS_PASSWORD=<strong-password>
```

---

## Support Resources

- **Backend Issues**: Check `logs/app.log`
- **Frontend Issues**: Check browser DevTools Console
- **Docker Issues**: Run `docker-compose logs -f`
- **Database Issues**: Connect with `docker exec -it chatapp-postgres psql`

---

## Next Steps

1. ✅ Complete setup and verification
2. Create test accounts
3. Explore API endpoints
4. Review code structure
5. Customize UI components
6. Configure email notifications
7. Setup file upload service
8. Deploy to production

---

**Last Updated**: February 12, 2026
