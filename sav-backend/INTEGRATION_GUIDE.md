# SAV Backend Integration Guide

## Overview

The SAV Backend is a modular monolith Spring Boot application designed to manage a ticketing system for customer support and service requests. It provides REST APIs for user management, ticket management, and file attachments with JWT-based authentication via Keycloak.

### Architecture
- **Framework**: Spring Boot 3.2.5 with Java 17
- **Architecture**: Modular monolith with Domain-Driven Design (DDD)
- **Authentication**: OAuth2 JWT tokens via Keycloak
- **Database**: PostgreSQL with Flyway migrations
- **Gateway**: Spring Cloud Gateway for routing and CORS
- **Caching**: Redis for session management

### Main Modules
- **Domains**: User and Ticket bounded contexts
- **Platform**: Gateway and Security modules
- **Infrastructure**: Shared components and configuration
- **Application**: Main application entry point

## APIs

### Base Configuration
- **Backend Port**: 8090
- **Gateway Port**: 8081 (recommended entry point)
- **Context Path**: `/api`
- **Base URL**: `http://localhost:8081/api` (via gateway)

### Authentication
All endpoints require JWT Bearer token authentication except:
- `/actuator/**` - Health and monitoring endpoints
- `/debug/**` - Debug endpoints for development
- `/public/**` - Public resources

### User Management APIs

#### GET /api/users/me
- **Description**: Get current user profile
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: UserResponse
```json
{
  "id": "string",
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "fullName": "string",
  "email": "string",
  "phoneNumber": "string",
  "role": "USER|TECHNICIAN|ADMIN",
  "status": "ACTIVE|INACTIVE|SUSPENDED|PENDING_ACTIVATION",
  "company": "string",
  "department": "string",
  "createdAt": "2024-01-01T10:00:00",
  "updatedAt": "2024-01-01T10:00:00"
}
```

#### PUT /api/users/me
- **Description**: Update current user profile
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Request**: UpdateUserProfileRequest
```json
{
  "firstName": "string",
  "lastName": "string",
  "phoneNumber": "string",
  "company": "string",
  "department": "string",
  "email": "valid-email@domain.com"
}
```
- **Response**: UserResponse

#### POST /api/users
- **Description**: Create new user (Admin only)
- **Authorization**: ADMIN
- **Request**: CreateUserRequest
```json
{
  "username": "string",
  "firstName": "string",
  "lastName": "string",
  "email": "valid-email@domain.com",
  "phoneNumber": "string",
  "role": "USER|TECHNICIAN|ADMIN",
  "company": "string",
  "department": "string"
}
```
- **Response**: UserResponse (201 Created)

#### GET /api/users
- **Description**: Get all active users
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: List<UserResponse>

#### GET /api/users/{userId}
- **Description**: Get user by ID
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: UserResponse

#### GET /api/users/technicians
- **Description**: Get available technicians
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: List<UserResponse>

#### GET /api/users/role/{role}
- **Description**: Get users by role
- **Authorization**: ADMIN
- **Response**: List<UserResponse>

#### PUT /api/users/{userId}/role
- **Description**: Update user role
- **Authorization**: ADMIN
- **Request**: UpdateUserRoleRequest
```json
{
  "role": "USER|TECHNICIAN|ADMIN"
}
```

#### PUT /api/users/{userId}/status
- **Description**: Update user status
- **Authorization**: ADMIN
- **Request**: UpdateUserStatusRequest
```json
{
  "status": "ACTIVE|INACTIVE|SUSPENDED|PENDING_ACTIVATION"
}
```

#### GET /api/users/statistics
- **Description**: Get user statistics
- **Authorization**: ADMIN
- **Response**: UserStatsResponse

#### PATCH /api/users/{userId}/activate
- **Description**: Activate user
- **Authorization**: ADMIN
- **Response**: UserResponse

#### PATCH /api/users/{userId}/deactivate
- **Description**: Deactivate user
- **Authorization**: ADMIN
- **Response**: UserResponse

#### GET /api/users/status/{status}
- **Description**: Get users by status
- **Authorization**: ADMIN
- **Response**: List<UserResponse>

#### GET /api/users/search?username={username}
- **Description**: Search user by username
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: UserResponse

### Ticket Management APIs

#### POST /api/tickets
- **Description**: Create a new ticket
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Request**: CreateTicketRequest
```json
{
  "title": "string",
  "description": "string",
  "type": "BUG|FEATURE_REQUEST|ASSISTANCE|INCIDENT|RECLAMATION|RELANCE",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL"
}
```
- **Response**: TicketResponse (201 Created)

#### GET /api/tickets
- **Description**: Get all tickets with pagination
- **Authorization**: TECHNICIAN, ADMIN
- **Query Parameters**:
  - `page` (default: 0)
  - `size` (default: 20)
  - `sortBy` (default: "createdAt")
  - `sortDir` (default: "desc")
- **Response**: Page<TicketResponse>

#### GET /api/tickets/{ticketId}
- **Description**: Get ticket by ID with messages
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: TicketResponse

#### PUT /api/tickets/{ticketId}
- **Description**: Update ticket
- **Authorization**: TECHNICIAN, ADMIN
- **Request**: UpdateTicketRequest
```json
{
  "title": "string",
  "description": "string",
  "status": "OPEN|ASSIGNED|IN_PROGRESS|RESOLVED|REOPENED|CLOSED",
  "priority": "LOW|MEDIUM|HIGH|CRITICAL",
  "assignedTeam": "SUPPORT|DEVELOPMENT",
  "assignedUserId": "string"
}
```

#### PATCH /api/tickets/{ticketId}/assign-team
- **Description**: Assign ticket to team
- **Authorization**: ADMIN
- **Request**: AssignTeamRequest
```json
{
  "team": "SUPPORT|DEVELOPMENT"
}
```

#### PATCH /api/tickets/{ticketId}/assign-user
- **Description**: Assign ticket to user
- **Authorization**: ADMIN
- **Request**: AssignUserRequest
```json
{
  "userId": "string"
}
```

#### PATCH /api/tickets/{ticketId}/close
- **Description**: Close ticket
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: TicketResponse

#### PATCH /api/tickets/{ticketId}/reopen
- **Description**: Reopen closed ticket
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: TicketResponse

#### GET /api/tickets/my-tickets
- **Description**: Get current user's tickets
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: List<TicketResponse>

#### GET /api/tickets/assigned-to-me
- **Description**: Get tickets assigned to current user
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: List<TicketResponse>

#### GET /api/tickets/status/{status}
- **Description**: Get tickets by status with pagination
- **Authorization**: TECHNICIAN, ADMIN
- **Query Parameters**: `page`, `size`
- **Response**: Page<TicketResponse>

#### GET /api/tickets/priority/{priority}
- **Description**: Get tickets by priority
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: List<TicketResponse>

#### GET /api/tickets/team/{team}
- **Description**: Get tickets by team
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: List<TicketResponse>

#### GET /api/tickets/statistics
- **Description**: Get ticket statistics
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: TicketStatsResponse
```json
{
  "totalTickets": 0,
  "openTickets": 0,
  "inProgressTickets": 0,
  "assignedTickets": 0,
  "closedTickets": 0
}
```

#### GET /api/tickets/dashboard
- **Description**: Get dashboard summary for current user
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: DashboardResponse
```json
{
  "myTicketsCount": 0,
  "assignedToMeCount": 0,
  "myOpenTickets": 0,
  "myInProgressTickets": 0,
  "recentTickets": [...]
}
```

### Ticket Message APIs

#### POST /api/tickets/{ticketId}/messages
- **Description**: Add message to ticket
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Request**: CreateTicketMessageRequest
```json
{
  "content": "string"
}
```
- **Response**: TicketMessageResponse (201 Created)

#### GET /api/tickets/{ticketId}/messages
- **Description**: Get all messages for ticket
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: List<TicketMessageResponse>

#### DELETE /api/tickets/{ticketId}/messages/{messageId}
- **Description**: Delete message
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: 204 No Content

### Ticket Attachment APIs

#### POST /api/tickets/{ticketId}/attachments
- **Description**: Upload attachment to ticket
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Request**: Multipart file upload
- **Response**: TicketAttachmentResponse (201 Created)

#### GET /api/tickets/{ticketId}/attachments
- **Description**: Get all attachments for ticket
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: List<TicketAttachmentResponse>

#### DELETE /api/tickets/{ticketId}/attachments/{attachmentId}
- **Description**: Delete attachment
- **Authorization**: TECHNICIAN, ADMIN
- **Response**: 204 No Content

#### GET /api/tickets/{ticketId}/attachments/{attachmentId}/download
- **Description**: Download attachment
- **Authorization**: USER, TECHNICIAN, ADMIN
- **Response**: File download URL

### Debug APIs (Development Only)

#### GET /api/debug/token-info
- **Description**: Get JWT token information for debugging
- **Authorization**: None required
- **Response**: Token claims and authentication details

## Data Models

### User Entity
```json
{
  "id": "string (UUID)",
  "username": "string (unique)",
  "firstName": "string",
  "lastName": "string",
  "email": "string (unique)",
  "phoneNumber": "string",
  "role": "UserRole enum",
  "status": "UserStatus enum",
  "company": "string",
  "department": "string",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime"
}
```

### Ticket Entity
```json
{
  "id": "Long",
  "title": "string",
  "description": "string",
  "status": "TicketStatus enum",
  "type": "TicketType enum",
  "priority": "Priority enum",
  "createdAt": "LocalDateTime",
  "updatedAt": "LocalDateTime",
  "createdByUserId": "string",
  "assignedTeam": "Team enum",
  "assignedUserId": "string",
  "messages": "List<TicketMessage>",
  "attachments": "List<TicketAttachment>"
}
```

### TicketMessage Entity
```json
{
  "id": "Long",
  "content": "string",
  "createdAt": "LocalDateTime",
  "authorId": "string",
  "ticket": "Ticket"
}
```

### TicketAttachment Entity
```json
{
  "id": "Long",
  "filename": "string",
  "fileUrl": "string",
  "uploadedAt": "LocalDateTime",
  "ticket": "Ticket"
}
```

## Enums

### UserRole
- `USER` - Regular user who can create tickets
- `TECHNICIAN` - Support technician who can manage tickets
- `ADMIN` - Administrator with full system access

### UserStatus
- `ACTIVE` - User is active and can use the system
- `INACTIVE` - User is temporarily inactive
- `SUSPENDED` - User is suspended
- `PENDING_ACTIVATION` - User registration is pending approval

### TicketStatus
- `OPEN` - Newly created ticket
- `ASSIGNED` - Ticket assigned to team/user
- `IN_PROGRESS` - Work in progress
- `RESOLVED` - Issue resolved, awaiting confirmation
- `REOPENED` - Previously closed ticket reopened
- `CLOSED` - Ticket completely closed

### TicketType
- `BUG` - Software bug report
- `FEATURE_REQUEST` - New feature request
- `ASSISTANCE` - User needs help/support
- `INCIDENT` - System incident
- `RECLAMATION` - Complaint or claim
- `RELANCE` - Follow-up request

### Priority
- `LOW` - Low priority
- `MEDIUM` - Medium priority
- `HIGH` - High priority
- `CRITICAL` - Critical priority

### Team
- `SUPPORT` - Customer support team
- `DEVELOPMENT` - Development team

## Configuration Details

### CORS Settings (Gateway)
- **Allowed Origins**: 
  - `http://localhost:3000` (React frontend)
  - `http://127.0.0.1:3000`
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
- **Allowed Headers**: `*`
- **Exposed Headers**: Authorization, Content-Type, Accept, Location
- **Allow Credentials**: true
- **Max Age**: 3600 seconds

### Database Configuration
- **Type**: PostgreSQL
- **Host**: localhost:5432
- **Database**: postgres
- **Username**: admin
- **Password**: admin123
- **Connection Pool**: HikariCP (max 20 connections)

### Authentication Configuration
- **Provider**: Keycloak OAuth2 JWT
- **Issuer URI**: `http://localhost:8180/realms/sav-realm`
- **Session Management**: Stateless
- **JWT Claims**: 
  - Subject (sub) used as user ID
  - Roles extracted from `realm_access.roles` or `resource_access.sav-backend.roles`

### Caching Configuration
- **Provider**: Redis
- **Host**: localhost:6379
- **Pool**: Jedis (max 8 connections)

## Docker Setup

### Services (docker-compose.yml)

#### PostgreSQL Database
- **Container**: sav-postgres
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Environment**:
  - POSTGRES_USER: admin
  - POSTGRES_PASSWORD: admin123
  - POSTGRES_DB: postgres
- **Volume**: postgres_data

#### PgAdmin
- **Container**: sav-pgadmin
- **Image**: dpage/pgadmin4:latest
- **Port**: 8082
- **Credentials**: admin@sav.com / admin123

#### Keycloak
- **Container**: sav-keycloak
- **Image**: quay.io/keycloak/keycloak:23.0
- **Ports**: 8180 (HTTP), 8543 (HTTPS)
- **Admin Credentials**: admin / admin123
- **Database**: Uses PostgreSQL

#### Redis
- **Container**: sav-redis
- **Image**: redis:7-alpine
- **Port**: 6379

#### MailHog (Email Testing)
- **Container**: sav-mailhog
- **Image**: mailhog/mailhog:latest
- **Ports**: 1025 (SMTP), 8025 (Web UI)

### Network
- **Name**: sav-network
- **Driver**: bridge

## Integration Guidelines

### Frontend Integration

#### Authentication Flow
1. Redirect users to Keycloak for authentication
2. Obtain JWT token from Keycloak
3. Include token in all API requests: `Authorization: Bearer <token>`
4. Handle token refresh as needed

#### Required Headers
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
Accept: application/json
```

#### Error Handling
Errors follow standard HTTP status codes:
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server error

#### Validation Rules
- Email fields must be valid email format
- Required fields are marked with `@NotNull` or `@NotBlank`
- Enum values must match exactly (case-sensitive)
- File uploads use multipart/form-data

### External Service Integration

#### Keycloak Configuration
1. Create realm: `sav-realm`
2. Create client: `sav-backend`
3. Configure client roles: USER, TECHNICIAN, ADMIN
4. Set JWT issuer URI in application configuration

#### File Storage Integration
- Current implementation uses placeholder URLs
- Recommended: Integrate with cloud storage (AWS S3, Azure Blob, etc.)
- Update `TicketAttachmentService` for production file handling

#### Email Notifications
- Configured to use MailHog for development
- Production: Configure SMTP settings in application.yml
- Email templates can be added to resources/templates

### Monitoring and Health Checks

#### Actuator Endpoints
- **Health**: `/actuator/health`
- **Info**: `/actuator/info`
- **Metrics**: `/actuator/metrics`
- **Prometheus**: `/actuator/prometheus`

#### Gateway Routes
- Backend API: All `/api/**` routes forwarded to backend
- Actuator: `/actuator/**` routes forwarded to backend
- Fallback: All other routes prefixed with `/api` and forwarded

## Technical Notes

### Security
- CSRF disabled (stateless JWT authentication)
- CORS handled at gateway level
- Method-level security with `@PreAuthorize`
- JWT token validation with role-based access control

### Database Migrations
- Flyway manages database schema
- Migration files in `src/main/resources/db/migration/`
- Automatic execution on application startup

### Business Rules
- Users can only view/edit their own tickets (except TECHNICIAN/ADMIN)
- Only ADMIN can assign tickets to teams/users
- Only TECHNICIAN/ADMIN can close/reopen tickets
- File attachments stored with metadata only (URLs)

### Logging
- SLF4J with Logback
- DEBUG level for security and SQL
- Structured console logging pattern
- Request/response logging for authentication flows

### Performance Considerations
- Database indexes on frequently queried columns
- Lazy loading for entity relationships
- Pagination for large result sets
- Connection pooling with HikariCP
- Redis caching for session data

### Development vs Production
- Development profile enables SQL logging and relaxed security
- Test profile disables OAuth2 for testing
- Production profile should use external configuration
- Environment-specific application.yml profiles included
