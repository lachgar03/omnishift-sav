# SAV Backend Integration Guide for React Frontend

This guide provides comprehensive information for React frontend developers to integrate with the SAV Backend API.

## Table of Contents

1. [Authentication & Security](#authentication--security)
2. [API Endpoints](#api-endpoints)
3. [DTOs (Data Transfer Objects)](#dtos-data-transfer-objects)
4. [Enums](#enums)
5. [Request & Response Handling](#request--response-handling)
6. [Special Notes](#special-notes)

---

## Authentication & Security

### How Authentication Works

The SAV Backend uses **OAuth2 JWT tokens via Keycloak** for authentication. All API requests must include a valid JWT token in the Authorization header.

### Required Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Role-Based Access Control

The system supports three user roles:

- **USER**: Basic users who can create tickets and manage their own tickets
- **TECHNICIAN**: Support staff who can manage all tickets and users
- **ADMIN**: Full administrative access to all resources

### JWT Token Structure

The JWT token contains the following claims:
- `sub`: User ID (UUID)
- `preferred_username`: Username
- `email`: User email
- `given_name`: First name
- `family_name`: Last name
- `name`: Full name
- `realm_access.roles`: Array of user roles
- `resource_access.sav-backend.roles`: Client-specific roles

### Authentication Flow

1. User authenticates with Keycloak
2. Keycloak returns JWT token
3. Frontend includes token in all API requests
4. Backend validates token and extracts user information
5. User is automatically created/synced in the database on first API call

---

## API Endpoints

### Base URLs

- **Backend API**: `http://localhost:8090/api`
- **Gateway**: `http://localhost:8081/api`
- **Swagger UI**: `http://localhost:8090/swagger-ui.html`

### Ticket Management

#### Create Ticket
```http
POST /api/tickets
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Bug in login system",
  "description": "Users cannot login with special characters",
  "type": "BUG",
  "priority": "HIGH"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Bug in login system",
  "description": "Users cannot login with special characters",
  "status": "OPEN",
  "type": "BUG",
  "priority": "HIGH",
  "createdAt": "2024-01-15T10:30:00",
  "updatedAt": "2024-01-15T10:30:00",
  "createdByUserId": "user-uuid",
  "assignedTeam": null,
  "assignedUserId": null,
  "messages": [],
  "attachments": []
}
```

#### Get All Tickets (Technician/Admin only)
```http
GET /api/tickets?page=0&size=20&sortBy=createdAt&sortDir=desc
Authorization: Bearer <token>
```

#### Get My Tickets
```http
GET /api/tickets/my-tickets?page=0&size=20&sortBy=createdAt&sortDir=desc
Authorization: Bearer <token>
```

#### Get Ticket by ID
```http
GET /api/tickets/{ticketId}
Authorization: Bearer <token>
```

#### Update Ticket
```http
PUT /api/tickets/{ticketId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS",
  "priority": "MEDIUM",
  "assignedTeam": "SUPPORT",
  "assignedUserId": "technician-uuid"
}
```

#### Assign Ticket to Team (Admin only)
```http
PATCH /api/tickets/{ticketId}/assign-team
Authorization: Bearer <token>
Content-Type: application/json

{
  "team": "SUPPORT"
}
```

#### Assign Ticket to User (Admin only)
```http
PATCH /api/tickets/{ticketId}/assign-user
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "technician-uuid"
}
```

#### Close Ticket (Technician/Admin only)
```http
PATCH /api/tickets/{ticketId}/close
Authorization: Bearer <token>
```

#### Reopen Ticket (Technician/Admin only)
```http
PATCH /api/tickets/{ticketId}/reopen
Authorization: Bearer <token>
```

#### Get Tickets by Status (Technician/Admin only)
```http
GET /api/tickets/status/{status}?page=0&size=20
Authorization: Bearer <token>
```

#### Get Tickets by Priority (Technician/Admin only)
```http
GET /api/tickets/priority/{priority}
Authorization: Bearer <token>
```

#### Get Tickets by Team (Technician/Admin only)
```http
GET /api/tickets/team/{team}
Authorization: Bearer <token>
```

#### Get Dashboard Summary
```http
GET /api/tickets/dashboard
Authorization: Bearer <token>
```

**Response:**
```json
{
  "myTicketsCount": 5,
  "assignedToMeCount": 3,
  "myOpenTickets": 2,
  "myInProgressTickets": 1,
  "recentTickets": [
    {
      "id": 1,
      "title": "Recent ticket",
      "status": "OPEN",
      "priority": "HIGH",
      "createdAt": "2024-01-15T10:30:00"
    }
  ]
}
```

#### Get Ticket Statistics (Technician/Admin only)
```http
GET /api/tickets/statistics
Authorization: Bearer <token>
```

### Ticket Messages

#### Add Message to Ticket
```http
POST /api/tickets/{ticketId}/messages
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "This is a message about the ticket"
}
```

#### Get Ticket Messages
```http
GET /api/tickets/{ticketId}/messages
Authorization: Bearer <token>
```

#### Delete Message (Technician/Admin only)
```http
DELETE /api/tickets/{ticketId}/messages/{messageId}
Authorization: Bearer <token>
```

### Ticket Attachments

#### Upload Attachment
```http
POST /api/tickets/{ticketId}/attachments
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file>
```

#### Get Ticket Attachments
```http
GET /api/tickets/{ticketId}/attachments
Authorization: Bearer <token>
```

#### Download Attachment
```http
GET /api/tickets/{ticketId}/attachments/{attachmentId}/download
Authorization: Bearer <token>
```

#### Delete Attachment (Technician/Admin only)
```http
DELETE /api/tickets/{ticketId}/attachments/{attachmentId}
Authorization: Bearer <token>
```

### User Management

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

#### Update Current User Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "company": "Acme Corp",
  "department": "IT"
}
```

#### Get All Users (Technician/Admin only)
```http
GET /api/users
Authorization: Bearer <token>
```

#### Get User by ID (Technician/Admin only)
```http
GET /api/users/{userId}
Authorization: Bearer <token>
```

#### Create User (Admin only)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "username": "johndoe",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "USER",
  "company": "Acme Corp",
  "department": "IT"
}
```

#### Get Available Technicians (Technician/Admin only)
```http
GET /api/users/technicians
Authorization: Bearer <token>
```

#### Get Users by Role (Admin only)
```http
GET /api/users/role/{role}
Authorization: Bearer <token>
```

#### Update User Role (Admin only)
```http
PUT /api/users/{userId}/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "TECHNICIAN"
}
```

#### Update User Status (Admin only)
```http
PUT /api/users/{userId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

#### Activate User (Admin only)
```http
PATCH /api/users/{userId}/activate
Authorization: Bearer <token>
```

#### Deactivate User (Admin only)
```http
PATCH /api/users/{userId}/deactivate
Authorization: Bearer <token>
```

#### Get Users by Status (Admin only)
```http
GET /api/users/status/{status}
Authorization: Bearer <token>
```

#### Search User by Username (Technician/Admin only)
```http
GET /api/users/search?username=johndoe
Authorization: Bearer <token>
```

#### Get User Statistics (Admin only)
```http
GET /api/users/statistics
Authorization: Bearer <token>
```

---

## DTOs (Data Transfer Objects)

### Ticket DTOs

#### CreateTicketRequest
```json
{
  "title": "string (3-255 chars, required)",
  "description": "string (max 2000 chars, optional)",
  "type": "BUG | FEATURE_REQUEST | ASSISTANCE | INCIDENT | RECLAMATION | RELANCE",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL"
}
```

#### UpdateTicketRequest
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "status": "OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | REOPENED | CLOSED",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "assignedTeam": "SUPPORT | DEVELOPMENT",
  "assignedUserId": "string (UUID, optional)"
}
```

#### UpdateMyTicketRequest
```json
{
  "title": "string (optional)",
  "description": "string (optional)"
}
```

#### TicketResponse
```json
{
  "id": "number",
  "title": "string",
  "description": "string",
  "status": "OPEN | ASSIGNED | IN_PROGRESS | RESOLVED | REOPENED | CLOSED",
  "type": "BUG | FEATURE_REQUEST | ASSISTANCE | INCIDENT | RECLAMATION | RELANCE",
  "priority": "LOW | MEDIUM | HIGH | CRITICAL",
  "createdAt": "string (ISO 8601 datetime)",
  "updatedAt": "string (ISO 8601 datetime)",
  "createdByUserId": "string (UUID)",
  "assignedTeam": "SUPPORT | DEVELOPMENT | null",
  "assignedUserId": "string (UUID) | null",
  "messages": "TicketMessageResponse[]",
  "attachments": "TicketAttachmentResponse[]"
}
```

#### CreateTicketMessageRequest
```json
{
  "content": "string (required, max 10000 chars)"
}
```

#### TicketMessageResponse
```json
{
  "id": "number",
  "content": "string",
  "createdAt": "string (ISO 8601 datetime)",
  "authorId": "string (UUID)"
}
```

#### TicketAttachmentResponse
```json
{
  "id": "number",
  "filename": "string",
  "fileUrl": "string",
  "uploadedAt": "string (ISO 8601 datetime)",
  "uploadedByUserId": "string (UUID)"
}
```

#### AssignTeamRequest
```json
{
  "team": "SUPPORT | DEVELOPMENT"
}
```

#### AssignUserRequest
```json
{
  "userId": "string (UUID)"
}
```

#### DashboardResponse
```json
{
  "myTicketsCount": "number",
  "assignedToMeCount": "number",
  "myOpenTickets": "number",
  "myInProgressTickets": "number",
  "recentTickets": "TicketResponse[]",
  "globalStats": "TicketStatsResponse (optional)",
  "urgentTickets": "TicketResponse[] (optional)",
  "unassignedTickets": "TicketResponse[] (optional)"
}
```

#### TicketStatsResponse
```json
{
  "totalTickets": "number",
  "openTickets": "number",
  "inProgressTickets": "number",
  "assignedTickets": "number",
  "closedTickets": "number",
  "resolvedTickets": "number",
  "reopenedTickets": "number"
}
```

### User DTOs

#### CreateUserRequest
```json
{
  "username": "string (required)",
  "firstName": "string (required)",
  "lastName": "string (required)",
  "email": "string (required, valid email)",
  "phoneNumber": "string (optional)",
  "role": "USER | TECHNICIAN | ADMIN",
  "company": "string (optional)",
  "department": "string (optional)"
}
```

#### UpdateUserProfileRequest
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phoneNumber": "string (optional)",
  "company": "string (optional)",
  "department": "string (optional)"
}
```

#### UpdateUserRoleRequest
```json
{
  "role": "USER | TECHNICIAN | ADMIN"
}
```

#### UpdateUserStatusRequest
```json
{
  "status": "ACTIVE | INACTIVE | SUSPENDED | PENDING_ACTIVATION"
}
```

#### UserResponse
```json
{
  "id": "string (UUID)",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string | null",
  "role": "USER | TECHNICIAN | ADMIN",
  "status": "ACTIVE | INACTIVE | SUSPENDED | PENDING_ACTIVATION",
  "company": "string | null",
  "department": "string | null",
  "createdAt": "string (ISO 8601 datetime)",
  "updatedAt": "string (ISO 8601 datetime)"
}
```

#### UserStatsResponse
```json
{
  "totalUsers": "number",
  "activeUsers": "number",
  "inactiveUsers": "number",
  "suspendedUsers": "number",
  "pendingUsers": "number",
  "adminUsers": "number",
  "technicianUsers": "number",
  "regularUsers": "number"
}
```

### Error DTOs

#### ErrorResponse
```json
{
  "timestamp": "string (ISO 8601 datetime)",
  "status": "number (HTTP status code)",
  "error": "string (error type)",
  "message": "string (error message)",
  "path": "string (request path)"
}
```

#### ValidationErrorResponse
```json
{
  "timestamp": "string (ISO 8601 datetime)",
  "status": "number (HTTP status code)",
  "error": "string (error type)",
  "message": "string (error message)",
  "validationErrors": {
    "fieldName": "error message",
    "anotherField": "error message"
  }
}
```

---

## Enums

### UserRole
- `USER`: Basic user role
- `TECHNICIAN`: Support technician role
- `ADMIN`: Administrator role

### UserStatus
- `ACTIVE`: User is active and can use the system
- `INACTIVE`: User is inactive and cannot use the system
- `SUSPENDED`: User is suspended temporarily
- `PENDING_ACTIVATION`: User is waiting for activation

### TicketStatus
- `OPEN`: Ticket is newly created and open
- `ASSIGNED`: Ticket has been assigned to a team or user
- `IN_PROGRESS`: Ticket is being worked on
- `RESOLVED`: Ticket has been resolved
- `REOPENED`: Ticket was closed but reopened
- `CLOSED`: Ticket is closed and completed

### TicketType
- `BUG`: Bug report
- `FEATURE_REQUEST`: Request for new feature
- `ASSISTANCE`: General assistance request
- `INCIDENT`: System incident
- `RECLAMATION`: Complaint or reclamation
- `RELANCE`: Follow-up request

### Priority
- `LOW`: Low priority
- `MEDIUM`: Medium priority
- `HIGH`: High priority
- `CRITICAL`: Critical priority

### Team
- `SUPPORT`: Support team
- `DEVELOPMENT`: Development team

---

## Request & Response Handling

### Standard Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Standard Response Format

All successful responses follow this pattern:
- **200 OK**: Successful GET, PUT, PATCH requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests

### Error Handling

The API returns structured error responses with the following HTTP status codes:

- **400 Bad Request**: Invalid request data or validation errors
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User lacks permission for the requested action
- **404 Not Found**: Resource not found
- **409 Conflict**: Data integrity violation
- **422 Unprocessable Entity**: Validation errors with detailed field information
- **500 Internal Server Error**: Unexpected server error
- **503 Service Unavailable**: Database or external service unavailable

### Error Response Examples

#### Validation Error (400)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Request validation failed",
  "validationErrors": {
    "title": "Title is required",
    "email": "Valid email is required"
  }
}
```

#### Unauthorized (401)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication failed",
  "path": "/api/tickets"
}
```

#### Forbidden (403)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 403,
  "error": "Forbidden",
  "message": "Access denied",
  "path": "/api/users"
}
```

#### Not Found (404)
```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Ticket not found",
  "path": "/api/tickets/999"
}
```

### Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (0-based, default: 0)
- `size`: Number of items per page (default: 20)
- `sortBy`: Field to sort by (default: "createdAt")
- `sortDir`: Sort direction - "asc" or "desc" (default: "desc")

**Example:**
```http
GET /api/tickets?page=0&size=10&sortBy=priority&sortDir=asc
```

**Paginated Response:**
```json
{
  "content": [...],
  "pageable": {
    "sort": {
      "sorted": true,
      "unsorted": false
    },
    "pageNumber": 0,
    "pageSize": 10,
    "offset": 0,
    "paged": true,
    "unpaged": false
  },
  "totalElements": 50,
  "totalPages": 5,
  "last": false,
  "first": true,
  "numberOfElements": 10,
  "size": 10,
  "number": 0,
  "sort": {
    "sorted": true,
    "unsorted": false
  }
}
```

### Token Refresh Logic

When a JWT token expires (401 Unauthorized response), the frontend should:

1. Redirect user to Keycloak login
2. Obtain new JWT token
3. Retry the original request with new token
4. Update stored token in localStorage/sessionStorage

### Retry Logic

For transient errors (5xx), implement exponential backoff:

```javascript
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      if (error.status >= 500 && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      throw error;
    }
  }
};
```

---

## Special Notes

### Pagination Strategy

- All list endpoints support pagination
- Default page size is 20 items
- Maximum page size should be limited to 100 items
- Use `totalElements` and `totalPages` for pagination UI
- Sort parameters are case-sensitive

### Sorting/Filtering Conventions

- Sort fields use camelCase (e.g., `createdAt`, `updatedAt`)
- Sort direction: `asc` or `desc` (case-insensitive)
- Filtering is done via query parameters
- Date filters use ISO 8601 format

### File Upload/Download Handling

#### File Upload
- Maximum file size: 10MB
- Allowed file types: PDF, DOC, DOCX, TXT, RTF, ODT, JPG, JPEG, PNG, GIF, BMP, WEBP, XLS, XLSX, CSV, ODS, ZIP, RAR, 7Z, TAR, GZ, LOG, XML, JSON
- Use `multipart/form-data` content type
- File parameter name: `file`

#### File Download
- Download endpoint returns file URL or stream
- Implement proper file access validation
- Consider implementing signed URLs for security

### CORS Configuration

- CORS is handled by the Spring Cloud Gateway
- Allowed origins should be configured in gateway settings
- Preflight requests are automatically handled

### Rate Limiting

- Consider implementing rate limiting for production
- Monitor API usage and implement appropriate limits
- Use HTTP 429 (Too Many Requests) for rate limit exceeded

### WebSocket Support

- Currently not implemented
- Consider WebSocket for real-time ticket updates
- Could be added for live notifications

### API Versioning

- Current API version: v1 (implicit)
- Consider adding versioning for future breaking changes
- Use URL path versioning: `/api/v1/tickets`

### Monitoring and Logging

- All requests are logged with trace IDs
- Use trace ID for debugging: `X-Trace-Id` header
- Monitor API performance and error rates
- Health check endpoint: `/actuator/health`

### Security Considerations

- Always validate file uploads on frontend
- Sanitize user input before display
- Implement proper error handling to avoid information leakage
- Use HTTPS in production
- Implement proper session management

### Development vs Production

- Development uses seeded data
- Production requires proper Keycloak configuration
- Database migrations are handled automatically
- Environment-specific configurations are managed via Spring profiles

---

## Quick Start for React Integration

### 1. Install Dependencies

```bash
npm install axios
# or
yarn add axios
```

### 2. Create API Client

```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8090/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle token expiration
      localStorage.removeItem('jwt_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### 3. Example API Calls

```javascript
// Get current user
const getCurrentUser = async () => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

// Create ticket
const createTicket = async (ticketData) => {
  const response = await apiClient.post('/tickets', ticketData);
  return response.data;
};

// Get tickets with pagination
const getTickets = async (page = 0, size = 20) => {
  const response = await apiClient.get(`/tickets?page=${page}&size=${size}`);
  return response.data;
};
```

This integration guide provides everything needed to successfully integrate a React frontend with the SAV Backend API. For additional support or questions, refer to the Swagger UI documentation at `http://localhost:8090/swagger-ui.html`.
