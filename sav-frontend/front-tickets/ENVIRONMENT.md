# Environment Configuration

## Required Environment Variables

Create a `.env.local` file in the project root with the following configuration:

```env
# Backend API Configuration
# Gateway port as specified in the backend guide
VITE_API_URL=http://localhost:8081/api

# Keycloak Configuration
# Keycloak port as specified in the backend guide (NOT the gateway port)
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=sav-realm
VITE_KEYCLOAK_CLIENT_ID=sav-frontend

# Development Configuration
# Frontend port for CORS (should match vite.config.ts)
VITE_FRONTEND_PORT=3000
```

## Backend Service Requirements

Make sure the following backend services are running:

1. **PostgreSQL**: `localhost:5432`
2. **Keycloak**: `localhost:8180` (Admin: admin/admin123)
3. **Redis**: `localhost:6379`
4. **Backend Gateway**: `localhost:8081`
5. **Backend Application**: `localhost:8090`

## CORS Configuration

The backend gateway is configured to allow:
- Origins: `http://localhost:3000`, `http://127.0.0.1:3000`
- Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD
- Headers: Authorization, Content-Type, Accept, Location
- Credentials: true

## Starting Services

Use docker-compose to start backend services:
```bash
cd ../backend
docker-compose up -d
```

## Verifying Configuration

Test your configuration by accessing:
- Frontend: http://localhost:3000
- Backend Health: http://localhost:8081/actuator/health
- Keycloak Admin: http://localhost:8180/admin
