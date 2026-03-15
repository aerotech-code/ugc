# Chat Application - API Documentation

## Base URL
```
Development: http://localhost:4000/api
Production: https://api.chatapp.com/api
```

## Authentication

All endpoints (except auth endpoints) require JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained through the login endpoint and should be included in subsequent requests.

---

## Endpoints

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "applicant"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "applicant",
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "applicant",
    "token": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "token": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

### Chat Endpoints

#### Get All Sessions
```http
GET /chat/sessions?userId=<userId>
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "status": "active",
      "assignedAgent": "uuid",
      "category": "general",
      "createdAt": "2026-02-12T10:00:00Z",
      "updatedAt": "2026-02-12T10:00:00Z"
    }
  ]
}
```

#### Get Session by ID
```http
GET /chat/sessions/<sessionId>
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "active",
    "messages": [...],
    "participants": [...]
  }
}
```

#### Create Session
```http
POST /chat/sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "uuid",
  "category": "general",
  "topic": "Application Status"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "status": "active",
    "createdAt": "2026-02-12T10:00:00Z"
  }
}
```

#### Get Messages in Session
```http
GET /chat/messages/<sessionId>?limit=50&offset=0
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "sender": "user",
      "type": "text",
      "content": {
        "text": "Hello!"
      },
      "timestamp": "2026-02-12T10:00:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 50,
    "offset": 0
  }
}
```

#### Send Message
```http
POST /chat/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "uuid",
  "type": "text",
  "content": "Hello, how can I help?"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "sessionId": "uuid",
    "sender": "user",
    "type": "text",
    "content": {
      "text": "Hello, how can I help?"
    },
    "timestamp": "2026-02-12T10:00:00Z"
  }
}
```

---

### User Endpoints

#### Get User Profile
```http
GET /users/<userId>
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "applicant",
    "firstName": "John",
    "lastName": "Doe",
    "avatar": "https://...",
    "department": "HR",
    "position": "Manager",
    "isActive": true,
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

#### Update User Profile
```http
PUT /users/<userId>
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "department": "Finance",
  "position": "Senior Manager",
  "avatar": "https://..."
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    ...
  }
}
```

#### Get All Users (Admin Only)
```http
GET /users?role=reviewer&isActive=true
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "reviewer@example.com",
      "role": "reviewer",
      ...
    }
  ]
}
```

---

### Application Endpoints

#### Get User Applications
```http
GET /applications/user/<userId>
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "type": "leave_request",
      "status": "submitted",
      "formData": {...},
      "documents": [...],
      "submittedAt": "2026-02-12T10:00:00Z",
      "createdAt": "2026-02-12T09:00:00Z"
    }
  ]
}
```

#### Create Application
```http
POST /applications
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "uuid",
  "requestType": "leave_request",
  "formData": {
    "startDate": "2026-03-01",
    "endDate": "2026-03-05",
    "reason": "Vacation"
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "id": "uuid",
    "sessionId": "uuid",
    "type": "leave_request",
    "status": "draft",
    "formData": {...},
    "createdAt": "2026-02-12T10:00:00Z"
  }
}
```

#### Submit Application
```http
POST /applications/<applicationId>/submit
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "submitted",
    "submittedAt": "2026-02-12T10:00:00Z"
  }
}
```

#### Get Pending Applications (Admin)
```http
GET /applications/admin/pending
Authorization: Bearer <admin-token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sessionId": "uuid",
      "type": "leave_request",
      "status": "submitted",
      "submittedBy": "user@example.com",
      "submittedAt": "2026-02-12T10:00:00Z",
      "documents": [...]
    }
  ]
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:4000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

### Join Session
```javascript
socket.emit('join_session', {
  sessionId: 'uuid',
  userId: 'uuid'
});

socket.on('user_joined', (data) => {
  console.log(data.userId + ' joined');
});
```

### Send Message
```javascript
socket.emit('send_message', {
  sessionId: 'uuid',
  userId: 'uuid',
  content: 'Hello!',
  type: 'text'
});

socket.on('message_received', (message) => {
  console.log(message);
});
```

### Typing Indicator
```javascript
socket.emit('typing', {
  sessionId: 'uuid',
  userId: 'uuid',
  isTyping: true
});

socket.on('user_typing', (data) => {
  console.log(data.userId + ' is typing: ' + data.isTyping);
});
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Error details (development only)"
}
```

---

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Headers**:
  - `X-RateLimit-Limit`: Total allowed requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Time when limit resets

---

## Testing

### Using cURL

#### Register
```bash
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456",
    "firstName": "Test",
    "lastName": "User"
  }'
```

#### Login
```bash
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123456"
  }'
```

#### Get Profile
```bash
curl -X GET http://localhost:4000/api/users/uuid \
  -H "Authorization: Bearer your-token"
```

---

## Changelog

### Version 1.0.0 (February 2026)
- Initial release
- Chat functionality
- User management
- Application workflows
- Real-time messaging

---

**Last Updated**: February 12, 2026
