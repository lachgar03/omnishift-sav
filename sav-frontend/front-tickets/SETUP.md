# SAV Frontend Setup Guide

## Project Overview
This is a React + Vite + TypeScript + TanStack Router + Mantine frontend application for the SAV (Support and Assistance) system.

## Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Package Manager**: Yarn
- **Routing**: TanStack Router v1
- **UI Library**: Mantine v8
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Authentication**: Keycloak
- **Styling**: Mantine + CSS Modules

## Prerequisites
- Node.js 18+ 
- Yarn package manager
- Backend API running on http://localhost:8090
- Keycloak server running on http://localhost:8180

## Environment Variables
Create a `.env` file in the root directory with the following variables:

```env
# API Configuration
VITE_API_URL=http://localhost:8090/api

# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=sav-realm
VITE_KEYCLOAK_CLIENT_ID=sav-frontend
```

## Installation & Setup

1. **Install Dependencies**
   ```bash
   yarn install
   ```

2. **Start Development Server**
   ```bash
   yarn dev
   ```

3. **Build for Production**
   ```bash
   yarn build
   ```

4. **Type Checking**
   ```bash
   yarn type-check
   ```

5. **Linting**
   ```bash
   yarn lint
   ```

## Project Structure

```
src/
├── api/                    # API services and configuration
├── components/             # Reusable UI components
│   ├── admin/             # Admin-specific components
│   ├── shared/            # Shared components
│   ├── ui/                # Basic UI components
│   ├── users/             # User management components
│   └── workflow/          # Workflow components
├── constants/             # Application constants
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── layout/                # Layout components
├── routes/                # TanStack Router route files
├── services/              # Business logic services
├── store/                 # Zustand state stores
├── styles/                # Global styles and CSS
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
└── main.tsx              # Application entry point
```

## Key Features

### ✅ Authentication
- Keycloak integration
- JWT token management
- Automatic token refresh
- Role-based access control

### ✅ Routing
- File-based routing with TanStack Router
- Protected routes
- Role-based route access
- Type-safe navigation

### ✅ UI Components
- Mantine UI components
- Responsive design
- Dark/light theme support
- Custom styling

### ✅ State Management
- Zustand for global state
- TanStack Query for server state
- Optimistic updates

### ✅ API Integration
- Axios with interceptors
- Error handling
- Request/response transformation
- Automatic retry logic

## Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn type-check` - Run TypeScript type checking
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint errors
- `yarn format` - Format code with Prettier

## Development Notes

### Route Generation
The project uses TanStack Router's file-based routing. Routes are automatically generated when you run the dev server. The generated route tree is located at `src/routeTree.gen.ts`.

### Code Splitting
The build is configured with manual code splitting for better performance:
- `vendor` - React and React DOM
- `router` - TanStack Router
- `mantine` - Mantine UI components
- `query` - TanStack Query

### Type Safety
The project is fully typed with TypeScript. All API responses, route parameters, and component props are properly typed.

## Troubleshooting

### Common Issues

1. **Route not found errors**
   - Make sure the route file exists in the correct directory
   - Check that the route is properly exported
   - Restart the dev server to regenerate the route tree

2. **TypeScript errors**
   - Run `yarn type-check` to see all TypeScript errors
   - Make sure all imports are correct
   - Check that types are properly defined

3. **Build errors**
   - Run `yarn build` to see build errors
   - Check that all dependencies are installed
   - Verify that all files are properly formatted

4. **Authentication issues**
   - Verify Keycloak configuration
   - Check that the backend API is running
   - Ensure environment variables are set correctly

## Contributing

1. Follow the existing code style
2. Add proper TypeScript types
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed
