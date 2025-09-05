# SAV System - Frontend Integration Guide

## Project Overview

The SAV (Service Après-Vente) system is a full-stack support ticket management platform built for law firm software suites. The system enables clients to submit technical support tickets, track their resolution, and maintain a complete history of interactions.

### Project Context
- **Duration**: 3-month internship project
- **Primary Goal**: Create a functional MVP for client support management
- **Future Vision**: Foundation for AI-powered automated responses to recurring issues
- **Architecture**: Modular monolith with clear domain separation

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Gateway   │    │  Backend API    │
│  (Port 3000)    │───▶│  (Port 8081)    │───▶│  (Port 8090)    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                │                        │
                                ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Keycloak     │    │   PostgreSQL    │
                       │  (Port 8180)    │    │   Database      │
                       │                 │    │                 │
                       └─────────────────┘    └─────────────────┘
```

## Data Model Overview

Based on the provided domain model, the system manages:

### Core Entities
- **Tickets**: Main support requests with full lifecycle management
- **TicketMessages**: Communication history within tickets
- **TicketAttachments**: File uploads associated with tickets
- **Users**: System users with role-based access control

### Entity Relationships
```
Ticket (1) ──── (N) TicketMessage
Ticket (1) ──── (N) TicketAttachment
User (1) ────── (N) Ticket (as creator)
User (1) ────── (N) Ticket (as assignee)
```

### Enumerations
- **TicketStatus**: OPEN, ASSIGNED, IN_PROGRESS, RESOLVED, REOPENED, CLOSED
- **TicketType**: BUG, FEATURE_REQUEST, ASSISTANCE, INCIDENT, RECLAMATION, RELANCE
- **Priority**: LOW, MEDIUM, HIGH, CRITICAL
- **Team**: SUPPORT, DEVELOPMENT
- **UserRole**: USER, TECHNICIAN, ADMIN
- **UserStatus**: ACTIVE, INACTIVE, SUSPENDED, PENDING_ACTIVATION

## Application Routing Structure

### Public Routes (No Authentication Required)
```
/login                    # Keycloak login redirect
/callback                 # OAuth callback handler
/unauthorized            # Access denied page
```

### User Dashboard Routes (All Authenticated Users)
```
/dashboard               # Main dashboard (role-specific content)
├── /my-tickets         # User's created tickets
├── /profile           # User profile management
└── /settings          # User preferences
```

### Ticket Management Routes
```
/tickets
├── /                   # Ticket list (filtered by user role)
├── /create            # Create new ticket
├── /:id               # Ticket details view
├── /:id/edit          # Edit ticket (Technician/Admin)
└── /:id/messages      # Ticket conversation thread
```

### User Management Routes (Technician/Admin)
```
/users
├── /                   # User list
├── /create            # Create user (Admin only)
├── /:id               # User profile view
├── /:id/edit          # Edit user (Admin only)
└── /technicians       # Available technicians list
```

### Administration Routes (Admin Only)
```
/admin
├── /dashboard         # Admin dashboard with system stats
├── /users             # User management
├── /statistics        # System analytics
└── /settings          # System configuration
```

### Ticket Workflow Routes (Technician/Admin)
```
/workflow
├── /assigned          # Tickets assigned to current user
├── /unassigned        # Unassigned tickets
├── /priority/high     # High priority tickets
├── /priority/critical # Critical priority tickets
└── /team/:team        # Team-specific tickets (SUPPORT/DEVELOPMENT)
```

## Role-Based Route Access

### USER Role Navigation
```
Dashboard
├── My Tickets
│   ├── Open Tickets
│   ├── In Progress
│   └── Closed Tickets
├── Create Ticket
└── Profile Settings
```

### TECHNICIAN Role Navigation
```
Dashboard
├── Assigned to Me
├── All Tickets
│   ├── Filter by Status
│   ├── Filter by Priority
│   └── Search Tickets
├── My Tickets (personal)
├── Team Dashboard
└── Profile Settings
```

### ADMIN Role Navigation
```
Dashboard
├── System Overview
├── All Tickets
│   ├── Assign Tickets
│   ├── Manage Workflow
│   └── Ticket Analytics
├── User Management
│   ├── Create Users
│   ├── Manage Roles
│   └── User Statistics
├── System Statistics
└── Administration
```

## Page Components Architecture

### Layout Components
```
AppLayout
├── Header
│   ├── Logo
│   ├── Navigation Menu
│   ├── Search Bar
│   └── User Menu
├── Sidebar (role-based navigation)
└── Main Content Area
```

### Dashboard Components
```
Dashboard
├── StatisticsCards
├── RecentTickets
├── QuickActions
└── ActivityFeed
```

### Ticket Components
```
TicketView
├── TicketHeader
├── TicketDetails
├── MessageThread
├── AttachmentList
└── ActionButtons
```

## Navigation Flow Examples

### User Creating a Ticket
```
/dashboard → /tickets/create → /tickets/:id (redirect after creation)
```

### Technician Managing Tickets
```
/dashboard → /workflow/assigned → /tickets/:id → /tickets/:id/edit
```

### Admin User Management
```
/admin/dashboard → /users → /users/create → /users/:id
```

## State Management Considerations

### Authentication State
- JWT token storage
- User profile information
- Role-based permissions
- Session management

### Application State
- Current user context
- Navigation state
- Filter preferences
- Real-time notifications

### Data Caching
- Recent tickets
- User lists
- Statistics
- File upload status

## UI/UX Guidelines

### Responsive Design
- Mobile-first approach
- Tablet optimization
- Desktop full features

### Accessibility
- WCAG 2.1 compliance
- Keyboard navigation
- Screen reader support
- Color contrast standards

### Performance
- Lazy loading for routes
- Pagination for lists
- Image optimization
- API response caching

## Architecture Overview

```
Frontend (React) → Gateway (Port 8081) → Backend (Port 8090) + Keycloak (Port 8180)
```

## Base Configuration

### API Base URLs
- **Gateway URL**: `http://localhost:8081`
- **Backend API**: `http://localhost:8081/api` (via gateway)
- **Keycloak Auth**: `http://localhost:8081/realms/sav-realm` (via gateway)

### Authentication Flow
1. Redirect to Keycloak for login: `http://localhost:8081/realms/sav-realm/protocol/openid-connect/auth`
2. Handle callback with authorization code
3. Exchange code for JWT token
4. Include JWT in `Authorization: Bearer <token>` header for API calls

## Authentication Configuration

### Keycloak Client Settings
```javascript
const keycloakConfig = {
  url: 'http://localhost:8081',
  realm: 'sav-realm',
  clientId: 'sav-frontend',
  redirectUri: 'http://localhost:3000/',
  responseType: 'code',
  scope: 'openid',
  responseMode: 'fragment'
}
```

### JWT Token Claims
Your JWT token will contain:
- `sub`: User ID (UUID)
- `preferred_username`: Username
- `email`: User email
- `name`: Full name
- `realm_access.roles`: Array of user roles ['USER', 'TECHNICIAN', 'ADMIN']
- `resource_access.sav-backend.roles`: Client-specific roles

## API Endpoints Reference

### Authentication Endpoints
- `GET /debug/token-info` - Debug JWT token contents (authenticated)

### User Management

#### Current User
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile

#### User Administration (Admin/Technician only)
- `GET /api/users` - Get all users
- `GET /api/users/{userId}` - Get user by ID
- `GET /api/users/technicians` - Get available technicians
- `GET /api/users/role/{role}` - Get users by role
- `GET /api/users/status/{status}` - Get users by status
- `GET /api/users/search?username={username}` - Search user by username
- `GET /api/users/statistics` - Get user statistics

#### User Management (Admin only)
- `POST /api/users` - Create new user
- `PUT /api/users/{userId}/role` - Update user role
- `PUT /api/users/{userId}/status` - Update user status
- `PATCH /api/users/{userId}/activate` - Activate user
- `PATCH /api/users/{userId}/deactivate` - Deactivate user

### Ticket Management

#### Ticket CRUD
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get all tickets (paginated, Technician/Admin)
- `GET /api/tickets/{ticketId}` - Get ticket by ID
- `PUT /api/tickets/{ticketId}` - Update ticket (Technician/Admin)

#### User's Tickets
- `GET /api/tickets/my-tickets` - Get current user's tickets
- `GET /api/tickets/assigned-to-me` - Get tickets assigned to current user
- `GET /api/tickets/dashboard` - Get dashboard summary for current user

#### Ticket Filtering
- `GET /api/tickets/status/{status}` - Get tickets by status (paginated)
- `GET /api/tickets/priority/{priority}` - Get tickets by priority
- `GET /api/tickets/team/{team}` - Get tickets by team
- `GET /api/tickets/statistics` - Get ticket statistics

#### Ticket Actions
- `PATCH /api/tickets/{ticketId}/assign-team` - Assign to team (Admin)
- `PATCH /api/tickets/{ticketId}/assign-user` - Assign to user (Admin)
- `PATCH /api/tickets/{ticketId}/close` - Close ticket (Technician/Admin)
- `PATCH /api/tickets/{ticketId}/reopen` - Reopen ticket (Technician/Admin)

### Ticket Messages
- `POST /api/tickets/{ticketId}/messages` - Add message to ticket
- `GET /api/tickets/{ticketId}/messages` - Get all messages for ticket
- `DELETE /api/tickets/{ticketId}/messages/{messageId}` - Delete message (Technician/Admin)

### Ticket Attachments
- `POST /api/tickets/{ticketId}/attachments` - Upload attachment (multipart/form-data)
- `GET /api/tickets/{ticketId}/attachments` - Get ticket attachments
- `GET /api/tickets/{ticketId}/attachments/{attachmentId}/download` - Download attachment
- `DELETE /api/tickets/{ticketId}/attachments/{attachmentId}` - Delete attachment (Technician/Admin)

## Data Models

### User Response
```typescript
interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  role: 'USER' | 'TECHNICIAN' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';
  company?: string;
  department?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Create User Request (Admin only)
```typescript
interface CreateUserRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: 'USER' | 'TECHNICIAN' | 'ADMIN';
  company?: string;
  department?: string;
}
```

### Update User Profile Request
```typescript
interface UpdateUserProfileRequest {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  company?: string;
  department?: string;
  email?: string;
}
```

### Update User Role Request (Admin only)
```typescript
interface UpdateUserRoleRequest {
  role: 'USER' | 'TECHNICIAN' | 'ADMIN';
}
```

### Update User Status Request (Admin only)
```typescript
interface UpdateUserStatusRequest {
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'PENDING_ACTIVATION';
}
```

### User Statistics Response
```typescript
interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  clients: number;
  technicians: number;
  admins: number;
  inactiveUsers: number;
}
```

### Ticket Response
```typescript
interface TicketResponse {
  id: number;
  title: string;
  description: string;
  status: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'CLOSED';
  type: 'BUG' | 'FEATURE_REQUEST' | 'ASSISTANCE' | 'INCIDENT' | 'RECLAMATION' | 'RELANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  assignedTeam?: 'SUPPORT' | 'DEVELOPMENT';
  assignedUserId?: string;
  messages: TicketMessageResponse[];
  attachments: TicketAttachmentResponse[];
}
```

### Create Ticket Request
```typescript
interface CreateTicketRequest {
  title: string;
  description?: string;
  type: 'BUG' | 'FEATURE_REQUEST' | 'ASSISTANCE' | 'INCIDENT' | 'RECLAMATION' | 'RELANCE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
```

### Update Ticket Request (Technician/Admin only)
```typescript
interface UpdateTicketRequest {
  title?: string;
  description?: string;
  status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedTeam?: 'SUPPORT' | 'DEVELOPMENT';
  assignedUserId?: string;
}
```

### Assign Team Request (Admin only)
```typescript
interface AssignTeamRequest {
  team: 'SUPPORT' | 'DEVELOPMENT';
}
```

### Assign User Request (Admin only)
```typescript
interface AssignUserRequest {
  userId: string;
}
```

### Ticket Message Response
```typescript
interface TicketMessageResponse {
  id: number;
  content: string;
  createdAt: string;
  authorId: string;
}
```

### Create Ticket Message Request
```typescript
interface CreateTicketMessageRequest {
  content: string;
}
```

### Ticket Attachment Response
```typescript
interface TicketAttachmentResponse {
  id: number;
  filename: string;
  fileUrl: string;
  uploadedAt: string;
}
```

### Dashboard Response
```typescript
interface DashboardResponse {
  myTicketsCount: number;
  assignedToMeCount: number;
  myOpenTickets: number;
  myInProgressTickets: number;
  recentTickets: TicketResponse[];
  // Additional fields for admin/technician dashboards
  globalStats?: TicketStatsResponse;
  urgentTickets?: TicketResponse[];
  unassignedTickets?: TicketResponse[];
}
```

### Ticket Statistics Response
```typescript
interface TicketStatsResponse {
  totalTickets: number;
  openTickets: number;
  inProgressTickets: number;
  assignedTickets: number;
  resolvedTickets: number;
  reopenedTickets: number;
  closedTickets: number;
  // Calculated fields
  activeTickets: number; // computed: openTickets + inProgressTickets + assignedTickets + resolvedTickets + reopenedTickets
  completionRate: number; // computed: closedTickets / totalTickets * 100
}
```

### Ticket Filter Request
```typescript
interface TicketFilterRequest {
  status?: 'OPEN' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REOPENED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  assignedUserId?: string;
  createdByUserId?: string;
  searchTerm?: string;
  // Pagination
  page: number;
  size: number;
  sortBy: string;
  sortDirection: string;
}
```

## Authorization Rules

### Role-Based Access Control

#### USER Role
- Can create tickets
- Can view own tickets (`/my-tickets`)
- Can add messages to own tickets
- Can view ticket details
- Can upload attachments to own tickets

#### TECHNICIAN Role
- All USER permissions
- Can view all tickets
- Can view tickets assigned to them
- Can update ticket status and priority
- Can close/reopen tickets
- Can delete messages and attachments
- Can view user lists

#### ADMIN Role
- All TECHNICIAN permissions
- Can assign tickets to teams/users
- Can manage users (create, update roles/status)
- Can view user statistics
- Full system access

## Business Rules & Workflow

### Ticket Status Transitions
```
OPEN → ASSIGNED (when assigned to team)
ASSIGNED → IN_PROGRESS (when assigned to specific user)
IN_PROGRESS → RESOLVED (when technician marks as resolved)
RESOLVED → CLOSED (automatic or manual closure)
CLOSED → REOPENED (if issue resurfaces)
REOPENED → IN_PROGRESS (when work resumes)
```

### Team Assignment Logic
- **SUPPORT Team**: First-level support, general inquiries, assistance
- **DEVELOPMENT Team**: Bug fixes, feature requests, technical incidents

### Priority Levels
- **LOW**: Minor issues, general questions
- **MEDIUM**: Standard support requests
- **HIGH**: Issues affecting productivity
- **CRITICAL**: System down, urgent business impact

## Request/Response Examples

### Authentication
```javascript
// Include JWT in all API requests
const headers = {
  'Authorization': `Bearer ${jwtToken}`,
  'Content-Type': 'application/json'
}
```

### Create Ticket
```javascript
POST /api/tickets
{
  "title": "Login Issue",
  "description": "Cannot login to the system",
  "type": "INCIDENT",
  "priority": "HIGH"
}

// Response: TicketResponse with id, status: 'OPEN'
```

### Upload Attachment
```javascript
POST /api/tickets/123/attachments
Content-Type: multipart/form-data

file: [binary data]
```

### Get Current User
```javascript
GET /api/users/me

// Response: UserResponse with current user details
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (successful deletion)
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

### Error Response Format
```typescript
interface ErrorResponse {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}
```

## Pagination

For paginated endpoints (tickets, users):
```
GET /api/tickets?page=0&size=20&sortBy=createdAt&sortDir=desc
```

Response includes:
```typescript
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
```

## CORS Configuration

CORS is handled by the gateway and configured to allow:
- Origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Methods: `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`, `PATCH`
- Headers: `*`
- Credentials: `true`

## Environment Configuration

### Development Environment
```javascript
const config = {
  apiBaseUrl: 'http://localhost:8081/api',
  keycloakUrl: 'http://localhost:8081',
  realm: 'sav-realm',
  clientId: 'sav-frontend'
}
```

## Security Considerations

1. **JWT Storage**: Store JWT securely (httpOnly cookies recommended)
2. **Token Refresh**: Implement token refresh logic
3. **HTTPS**: Use HTTPS in production
4. **Input Validation**: Validate all user inputs
5. **File Upload**: Validate file types and sizes for attachments
6. **Error Messages**: Don't expose sensitive information in error messages

## Testing Endpoints

Use these endpoints to verify your integration:
1. `GET /api/debug/token-info` - Verify JWT token parsing
2. `GET /api/users/me` - Test authenticated requests
3. `POST /api/tickets` - Test creating resources
4. `GET /api/tickets/my-tickets` - Test filtered data access

## Common Integration Issues

1. **CORS Errors**: Ensure requests go through gateway (port 8081)
2. **Authentication**: Include Bearer token in Authorization header
3. **Base Path**: All API calls must include `/api` prefix
4. **Content-Type**: Use `application/json` for JSON requests
5. **File Uploads**: Use `multipart/form-data` for attachment uploads

## Frontend Implementation Tips

### TypeScript Enums
```typescript
export enum TicketStatus {
  OPEN = 'OPEN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  REOPENED = 'REOPENED',
  CLOSED = 'CLOSED'
}

export enum TicketType {
  BUG = 'BUG',
  FEATURE_REQUEST = 'FEATURE_REQUEST',
  ASSISTANCE = 'ASSISTANCE',
  INCIDENT = 'INCIDENT',
  RECLAMATION = 'RECLAMATION',
  RELANCE = 'RELANCE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum UserRole {
  USER = 'USER',
  TECHNICIAN = 'TECHNICIAN',
  ADMIN = 'ADMIN'
}
```

### Status Badge Colors
```typescript
const getStatusColor = (status: TicketStatus) => {
  switch (status) {
    case TicketStatus.OPEN: return 'blue';
    case TicketStatus.ASSIGNED: return 'orange';
    case TicketStatus.IN_PROGRESS: return 'yellow';
    case TicketStatus.RESOLVED: return 'green';
    case TicketStatus.REOPENED: return 'red';
    case TicketStatus.CLOSED: return 'gray';
  }
};

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case Priority.LOW: return 'green';
    case Priority.MEDIUM: return 'blue';
    case Priority.HIGH: return 'orange';
    case Priority.CRITICAL: return 'red';
  }
};
```