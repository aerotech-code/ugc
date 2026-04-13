# Quick Reference & Credentials Management

**⚠️ IMPORTANT**: This file contains sensitive information. Never commit to version control.

---

## 🔐 Credentials Vault

### Default Credentials (Development Only)

#### PostgreSQL
```
Host: localhost (or postgres in Docker)
Port: 5433
Database: chatapp
Username: postgres
Password: password
Connection String: postgresql://postgres:password@localhost:5433/chatapp
```

#### Redis
```
Host: localhost (or redis in Docker)
Port: 6379
Password: (empty)
```

#### Admin User (Create this after setup)
```
Email: admin@chatapp.com
Password: Admin@123456 (change after first login)
Role: admin
```

#### Test User
```
Email: test@example.com
Password: Test@123456
Role: applicant
```

---

## 🔑 JWT Secrets (Update These!)

### Generate New Secrets
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Current Secrets in .env
```
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-at-least-32-characters
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-change-this-in-production-at-least-32-characters
SESSION_SECRET=your-session-secret-change-this-in-production
```

---

## 📧 Email Configuration (Gmail Example)

### Setup Gmail App Password
1. Go to Google Account Security
2. Enable 2-Factor Authentication
3. Generate App Password (use "Mail" and "Windows Computer")
4. Copy the 16-character password

### Configuration
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
SMTP_FROM_NAME=Chat Application
SMTP_FROM_EMAIL=noreply@chatapp.com
```

---

## 🌐 API Keys & Third-Party Services

### AWS S3 (File Upload)
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=chatapp-uploads
```

### OpenAI API (Optional AI Features)
```
OPENAI_API_KEY=sk-your-api-key
```

### Anthropic API (Optional AI Features)
```
ANTHROPIC_API_KEY=your-api-key
```

---

## 🔗 Service URLs

### Development
```
Frontend: http://localhost:5173
Backend API: http://localhost:4000
API Base: http://localhost:4000/api
WebSocket: ws://localhost:4000
PostgreSQL: localhost:5433
Redis: localhost:6379
```

### Production (Template)
```
Frontend: https://yourapp.com
Backend API: https://api.yourapp.com
API Base: https://api.yourapp.com/api
WebSocket: wss://api.yourapp.com
PostgreSQL: db.yourapp.com:5432
Redis: redis.yourapp.com:6379
```

---

## 🐳 Docker Commands Reference

### Start Services
```bash
cd backenddev-master
docker-compose up -d
```

### View Logs
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Stop Services
```bash
docker-compose down
```

### Restart Service
```bash
docker-compose restart backend
docker-compose restart postgres
docker-compose restart redis
```

### View Service Status
```bash
docker-compose ps
```

### Execute Command in Container
```bash
# PostgreSQL
docker exec -it chatapp-postgres psql -U postgres -d chatapp

# Redis
docker exec -it chatapp-redis redis-cli

# Backend
docker exec -it chatapp-backend /bin/sh
```

---

## 📊 Database Access

### Connect via Docker
```bash
docker exec -it chatapp-postgres psql -U postgres -d chatapp
```

### Useful psql Commands
```sql
-- List tables
\dt

-- Describe table
\d users

-- List databases
\l

-- List users
\du

-- Exit
\q
```

### Sample Queries
```sql
-- Count users
SELECT COUNT(*) FROM users;

-- Get all users
SELECT id, email, role, created_at FROM users;

-- Get active sessions
SELECT id, user_id, status FROM chat_sessions WHERE status = 'active';

-- Get recent messages
SELECT * FROM messages ORDER BY timestamp DESC LIMIT 10;

-- Check application status
SELECT id, status, created_at FROM application_requests;
```

---

## 🧪 Testing Credentials

### Test User Account
```
Email: test@example.com
Password: Test@123456
Role: applicant
```

### Create Test User via API
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456",
    "firstName": "Test",
    "lastName": "User",
    "role": "applicant"
  }'
```

### Create Admin User
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chatapp.com",
    "password": "Admin@123456",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  }'
```

---

## 🔄 API Token Management

### Get Auth Token
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'

# Response will include:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIs...",
#     "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
#     ...
#   }
# }
```

### Use Token in Requests
```bash
curl -X GET http://localhost:4000/api/users/user-id \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

### Refresh Token
```bash
curl -X POST http://localhost:4000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }'
```

---

## 🛠️ Environment File Templates

### .env (Frontend)
```env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_WS_URL=ws://localhost:4000
VITE_ENV=development
VITE_APP_NAME=Chat Application
VITE_APP_VERSION=1.0.0
```

### .env (Backend)
```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:5173

DATABASE_URL=postgresql://postgres:password@localhost:5433/chatapp
REDIS_HOST=localhost
REDIS_PORT=6379

JWT_SECRET=<32-char-random-string>
JWT_EXPIRE=7d
REFRESH_TOKEN_SECRET=<32-char-random-string>
REFRESH_TOKEN_EXPIRE=30d

CORS_ORIGIN=http://localhost:5173

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_NAME=Chat Application
SMTP_FROM_EMAIL=noreply@chatapp.com

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=chatapp-uploads

LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

---

## 🚀 Deployment Checklist

### Before Production Deployment

- [ ] Update all secrets and API keys
- [ ] Generate new strong JWT secrets
- [ ] Setup SSL/TLS certificates
- [ ] Configure domain DNS
- [ ] Setup database backups
- [ ] Configure email service
- [ ] Setup AWS S3 bucket
- [ ] Enable HTTPS redirect
- [ ] Configure firewall rules
- [ ] Setup monitoring alerts
- [ ] Configure log aggregation
- [ ] Review security headers
- [ ] Test disaster recovery
- [ ] Setup uptime monitoring
- [ ] Enable rate limiting
- [ ] Configure WAF rules
- [ ] Setup DDoS protection
- [ ] Review all environment variables
- [ ] Test all API endpoints
- [ ] Test WebSocket connections
- [ ] Verify database backups
- [ ] Test rollback procedures

---

## 📱 Common Port Numbers

```
Frontend: 5173
Backend API: 4000
PostgreSQL: 5433 (Docker), 5432 (native)
Redis: 6379
Elasticsearch: 9200
Kafka: 9092
Prometheus: 9090
Grafana: 3000
```

---

## 🐛 Debugging Tips

### Enable Debug Mode
```env
LOG_LEVEL=debug
NODE_ENV=development
```

### View Real-time Logs
```bash
docker-compose logs -f --tail=100
```

### Check Database Connection
```bash
docker exec chatapp-postgres pg_isready
```

### Check Redis Connection
```bash
docker exec chatapp-redis redis-cli ping
```

### View Environment Variables
```bash
docker exec chatapp-backend env | grep -i database
```

---

## 🔒 Security Best Practices

### Do's ✅
- [ ] Use strong, randomly generated secrets
- [ ] Store secrets in environment variables
- [ ] Use HTTPS in production
- [ ] Enable CORS only for trusted domains
- [ ] Validate all user inputs
- [ ] Use prepared statements for queries
- [ ] Implement rate limiting
- [ ] Log security events
- [ ] Regularly update dependencies
- [ ] Use HTTPS for all external API calls

### Don'ts ❌
- [ ] Don't hardcode secrets in code
- [ ] Don't use simple passwords
- [ ] Don't disable CORS in production
- [ ] Don't trust user input
- [ ] Don't log sensitive data
- [ ] Don't skip security updates
- [ ] Don't expose error details to users
- [ ] Don't use old/deprecated APIs
- [ ] Don't commit .env files
- [ ] Don't share credentials in emails

---

## 📞 Support Contacts

- **Frontend Issues**: Check browser console (F12) and ARCHITECTURE.md
- **Backend Issues**: Check logs in `docker-compose logs -f`
- **Database Issues**: Connect and check directly with psql
- **Email Issues**: Verify SMTP settings in .env
- **File Upload Issues**: Check AWS S3 credentials

---

## 📝 Notes

**Last Updated**: February 12, 2026

**Security Reminder**: 
- Change all default passwords immediately
- Never commit this file or .env files to version control
- Rotate secrets regularly
- Use a secrets manager in production

---

**Generated For**: Chat Application Project  
**Status**: Development Ready  
**Revision**: 1.0  

