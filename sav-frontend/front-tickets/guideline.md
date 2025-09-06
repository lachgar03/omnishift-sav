# Frontend Integration Guideline for SAV Backend

## 1. System Architecture Overview

- **Architecture**: Microservices-based with API Gateway pattern
- **Domains**: User, Ticket (with hexagonal architecture)
- **Stack**: Spring Boot, PostgreSQL, Keycloak, Redis
- **Communication**: RESTful APIs via Gateway

## 2. API Gateway

- **Base URL**: `http://localhost:8080/api` (check gateway application.yml for exact port)
- **Purpose**: Single entry point for all frontend requests
- **Implementation**: Located in `platform/gateway/`
- **Authentication**: Token validation via Keycloak integration

## 3. Authentication & Authorization

- **Provider**: Keycloak (http://localhost:8180)
- **Credentials**: Admin access with `admin/admin123`
- **Frontend Integration**:
  ```javascript
  import Keycloak from 'keycloak-js';

  const keycloak = new Keycloak({
    url: 'http://localhost:8180',
    realm: 'sav-realm',  // Create this realm in Keycloak admin
    clientId: 'frontend-client'  // Create this client in Keycloak admin
  });

  keycloak.init({ onLoad: 'login-required' }).then(authenticated => {
    if (authenticated) {
      // Store token for API requests
      localStorage.setItem('token', keycloak.token);
    }
  });
  ```
- **API Authorization**: Include token in all requests
  ```javascript
  fetch('http://localhost:8080/api/users', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json'
    }
  });
  ```

## 4. API Endpoints

### User Domain
- `GET /api/users` - List all users
- `GET /api/users/{id}` - Get user by ID
- `POST /api/users` - Create user
- `PUT /api/users/{id}` - Update user
- `DELETE /api/users/{id}` - Delete user

### Ticket Domain
- `GET /api/tickets` - List all tickets
- `GET /api/tickets/{id}` - Get ticket by ID
- `POST /api/tickets` - Create ticket
- `PUT /api/tickets/{id}` - Update ticket
- `DELETE /api/tickets/{id}` - Delete ticket
- `GET /api/tickets/status/{status}` - Get tickets by status

## 5. Data Models

### User Domain
- **User DTO**:
  ```json
  {
    "id": "uuid-string",
    "username": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "roles": ["ADMIN", "USER", "TECHNICIAN"]
  }
  ```

### Ticket Domain
- **Ticket DTO**:
  ```json
  {
    "id": "uuid-string",
    "title": "string",
    "description": "string",
    "status": "OPEN|IN_PROGRESS|RESOLVED|CLOSED",
    "priority": "LOW|MEDIUM|HIGH|CRITICAL",
    "createdBy": "uuid-string",
    "assignedTo": "uuid-string",
    "createdAt": "2023-06-15T10:30:00Z",
    "updatedAt": "2023-06-15T14:45:00Z"
  }
  ```

## 6. CORS Configuration

- **Allowed Origins**: Configure in gateway to allow your frontend URL
  - Development: `http://localhost:3000` (React default)
  - Production: Add your production URL
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Authorization, Content-Type
- **Max Age**: 3600 (1 hour)

## 7. Environment Setup

### Required Services
- Start all backend services:
  ```bash
  docker-compose up -d
  ```

### Access Points
- **API Gateway**: http://localhost:8080/api
- **Keycloak Admin**: http://localhost:8180/admin (admin/admin123)
- **PgAdmin**: http://localhost:8082 (admin@sav.com/admin123)
- **Mailhog**: http://localhost:8025 (for email testing)

### Frontend Environment Variables
```
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_KEYCLOAK_URL=http://localhost:8180
REACT_APP_KEYCLOAK_REALM=sav-realm
REACT_APP_KEYCLOAK_CLIENT_ID=frontend-client
```

## 8. Error Handling

- **Standard Error Response**:
  ```json
  {
    "timestamp": "2023-06-15T10:30:00Z",
    "status": 400,
    "error": "Bad Request",
    "message": "Invalid input data",
    "path": "/api/tickets"
  }
  ```

- **Frontend Error Handling**:
  ```javascript
  fetch('/api/tickets')
    .then(response => {
      if (!response.ok) {
        return response.json().then(err => {
          throw new Error(`${err.error}: ${err.message}`);
        });
      }
      return response.json();
    })
    .catch(error => console.error('Error:', error));
  ```

## 9. API Security Best Practices

1. **Always validate tokens** before making API calls
2. **Implement token refresh** logic for long user sessions
3. **Use HTTPS** in production environments
4. **Sanitize all user inputs** before sending to API
5. **Implement proper logout** by clearing tokens

## 10. Testing

- **API Testing**: Use Swagger UI (if enabled) or Postman
- **Auth Testing**: Verify token validation and role-based access
- **Mock API**: Consider using MSW (Mock Service Worker) during frontend development

## 11. Additional Integration Notes

- **Caching**: Redis is available for backend caching - no specific frontend integration needed
- **Email Testing**: Use Mailhog UI (http://localhost:8025) to view sent emails
- **Pagination**: Most list endpoints support `?page=0&size=20&sort=createdAt,desc` parameters
- **API Documentation**: Check for Swagger UI at http://localhost:8080/swagger-ui.html

This guideline provides a comprehensive framework for integrating a frontend application with the SAV backend services. For specific implementation details, refer to the backend code structure and documentation.