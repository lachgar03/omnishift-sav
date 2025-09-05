# SAV System Frontend

A comprehensive support ticket management system built with React, TypeScript, and TanStack Router, following the SAV System Integration Guide specifications.

## 🎯 Project Overview

The SAV (Service Après-Vente) system is a full-stack support ticket management platform built for law firm software suites. This frontend application provides a modern, responsive interface for managing technical support tickets with role-based access control.

### Key Features Implemented

- **Role-Based Access Control**: USER, TECHNICIAN, and ADMIN roles with appropriate permissions
- **Comprehensive Ticket Management**: Full CRUD operations for tickets with status tracking
- **Real-time Dashboard**: Role-specific dashboards with statistics and recent activity
- **Advanced Filtering**: Status, priority, team, and search-based ticket filtering
- **File Attachments**: Support for ticket attachments and file management
- **Responsive Design**: Mobile-first approach with modern UI components

## 🏗️ Architecture

The application follows the modular architecture specified in the guide:

```
Frontend (React + TypeScript) → API Gateway (Port 8081) → Backend (Port 8090) + Keycloak (Port 8180)
```

### Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Routing**: TanStack Router with role-based route protection
- **State Management**: Zustand for client-side state
- **API Client**: TanStack Query with Axios
- **Authentication**: Keycloak integration with JWT tokens
- **UI Components**: Custom components with CSS modules
- **Build Tool**: Vite for fast development and building

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and Yarn
- Running SAV backend system (ports 8081, 8090, 8180)
- Keycloak realm configured with `sav-realm`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd front-tickets
```

2. Install dependencies:
```bash
yarn install
```

3. Configure environment variables:
```bash
cp .env.example .env.local
```

Update `.env.local` with your configuration:
```env
VITE_API_URL=http://localhost:8081
VITE_KEYCLOAK_URL=http://localhost:8081
VITE_KEYCLOAK_REALM=sav-realm
VITE_KEYCLOAK_CLIENT_ID=sav-frontend
```

4. Start the development server:
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 🔐 Authentication & Authorization

### Keycloak Integration

The app integrates with Keycloak for authentication and role management:

- **Realm**: `sav-realm`
- **Client**: `sav-frontend`
- **Roles**: USER, TECHNICIAN, ADMIN
- **JWT Claims**: Includes user information and role assignments

### Role-Based Access Control

#### USER Role
- Create and view own tickets
- Add messages to own tickets
- Upload attachments to own tickets
- Access to personal dashboard and settings

#### TECHNICIAN Role
- All USER permissions
- View all tickets in the system
- Update ticket status and priority
- Close/reopen tickets
- Access to workflow management
- View user lists and statistics

#### ADMIN Role
- All TECHNICIAN permissions
- Assign tickets to teams and users
- Create and manage users
- Update user roles and status
- Access to system administration
- View comprehensive system statistics

## 📱 Application Structure

### Routing Architecture

The application implements the complete routing structure specified in the guide:

```
/                           # Root redirect
├── /login                  # Keycloak authentication
├── /dashboard             # Role-specific dashboard
├── /tickets              # Ticket management
│   ├── /                 # Ticket list/create
│   ├── /my-tickets      # User's tickets
│   └── /:id             # Ticket details
├── /workflow             # Technician/Admin workflow
│   ├── /assigned        # Assigned tickets
│   ├── /unassigned      # Unassigned tickets
│   ├── /priority/high   # High priority tickets
│   ├── /priority/critical # Critical priority tickets
│   └── /team/:team      # Team-specific tickets
├── /users                # User management (Technician/Admin)
│   ├── /                # User list
│   ├── /:id             # User details
│   ├── /:id/edit        # Edit user
│   └── /technicians     # Available technicians
├── /admin                # Admin-only routes
│   ├── /dashboard       # Admin dashboard
│   ├── /users           # User management
│   ├── /statistics      # System analytics
│   └── /settings        # System configuration
└── /settings             # User profile settings
```

### Component Architecture

```
src/
├── components/           # Reusable UI components
│   ├── shared/          # Shared components
│   │   └── Navigation.tsx # Role-based navigation
│   ├── TicketForm.tsx   # Ticket creation/editing
│   ├── TicketList.tsx   # Ticket listing with filters
│   └── ui/              # Basic UI components
├── routes/               # Page components
│   ├── DashboardPage.tsx # Role-specific dashboards
│   ├── TicketsList.tsx  # Ticket management
│   └── auth/            # Authentication pages
├── api/                  # API services
│   ├── tickets.ts       # Ticket API operations
│   ├── users.ts         # User management API
│   └── authConfig.ts    # Keycloak integration
├── store/                # State management
│   └── authStore.ts     # Authentication state
├── types/                # TypeScript type definitions
├── constants/            # Application constants
└── utils/                # Utility functions
```

## 🔌 API Integration

### Endpoints Implemented

The application implements all API endpoints specified in the guide:

#### Ticket Management
- `POST /api/tickets` - Create tickets
- `GET /api/tickets` - List tickets with filtering
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update tickets
- `PATCH /api/tickets/:id/*` - Ticket actions (assign, close, reopen)

#### User Management
- `GET /api/users/me` - Current user profile
- `PUT /api/users/me` - Update profile
- `GET /api/users` - List users (Technician/Admin)
- `POST /api/users` - Create users (Admin)
- `PUT /api/users/:id/*` - User management (Admin)

#### Dashboard & Statistics
- `GET /api/tickets/dashboard` - User dashboard
- `GET /api/tickets/statistics` - Ticket statistics
- `GET /api/users/statistics` - User statistics

### Data Models

All data models match the guide specifications:

- **TicketResponse**: Complete ticket information with messages and attachments
- **UserResponse**: User profile with role and status
- **DashboardResponse**: Role-specific dashboard data
- **TicketStatsResponse**: Comprehensive ticket statistics

## 🎨 UI/UX Features

### Status & Priority System

- **Status Badges**: Color-coded status indicators (Open, Assigned, In Progress, etc.)
- **Priority Indicators**: Visual priority levels (Low, Medium, High, Critical)
- **Team Assignment**: Support and Development team badges

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimization
- Accessible navigation and controls

### Modern Interface

- Clean, professional design
- Intuitive user experience
- Consistent component styling
- Loading states and error handling

## 🧪 Testing

### Development Testing

```bash
# Run linting
yarn lint

# Run type checking
yarn type-check

# Run tests (when implemented)
yarn test
```

### API Testing

Use the provided test endpoints to verify integration:

1. `GET /api/debug/token-info` - Verify JWT token parsing
2. `GET /api/users/me` - Test authenticated requests
3. `POST /api/tickets` - Test creating resources
4. `GET /api/tickets/my-tickets` - Test filtered data access

## 🚧 Development Status

### ✅ Implemented

- Complete authentication system with Keycloak
- Role-based routing and access control
- Comprehensive ticket management
- User management (Admin/Technician)
- Dashboard with role-specific content
- API integration with all endpoints
- TypeScript types and interfaces
- Component architecture

### 🔄 In Progress

- Advanced ticket filtering and search
- File attachment handling
- Real-time notifications
- Advanced user management features

### 📋 Planned

- Ticket workflow automation
- Advanced reporting and analytics
- Mobile app optimization
- Performance monitoring
- Comprehensive testing suite

## 🤝 Contributing

1. Follow the established code structure and patterns
2. Ensure all new features follow the guide specifications
3. Maintain TypeScript type safety
4. Add appropriate error handling and loading states
5. Update documentation for new features

## 📚 Additional Resources

- [SAV System Integration Guide](./guide.md) - Complete system documentation
- [API Reference](./guide.md#api-endpoints-reference) - Detailed API documentation
- [Component Library](./src/components/) - Reusable UI components
- [Type Definitions](./src/types/) - TypeScript interfaces and types

## 📄 License

This project is part of the SAV System and follows the project's licensing terms.

---

**Note**: This frontend application is designed to work with the SAV backend system. Ensure all backend services are running and properly configured before starting the frontend application.
