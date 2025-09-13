# SAV Backend - Modular Monolith

A Spring Boot modular monolith application for ticket management system with JWT-based authentication via Keycloak.

## 🏗️ Architecture

- **Framework**: Spring Boot 3.2.5 with Java 17
- **Architecture**: Modular monolith with Domain-Driven Design (DDD)
- **Authentication**: OAuth2 JWT tokens via Keycloak
- **Database**: PostgreSQL with Flyway migrations
- **Gateway**: Spring Cloud Gateway for routing and CORS
- **Caching**: Redis for session management
- **Documentation**: OpenAPI 3.0 with Swagger UI

## 📦 Modules

- **Domains**: User and Ticket bounded contexts
- **Platform**: Gateway and Security modules
- **Infrastructure**: Shared components and configuration
- **Application**: Main application entry point

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Maven 3.9+
- Docker & Docker Compose
- PostgreSQL (or use Docker)

### Quick Start

1. **Start Infrastructure Services**
   ```bash
   docker compose up -d
   ```
   This starts:
   - PostgreSQL (port 5432)
   - Keycloak (port 8180)
   - Redis (port 6379)
   - Mailhog (port 8025)

2. **Build and Run Application**
   ```bash
   # Build
   ./mvnw clean install
   
   # Run with dev profile (includes seeded data)
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```

3. **Access the Application**
   ```bash
   # Health check
   curl http://localhost:8090/actuator/health
   
   # API endpoints (will return 401 without auth)
   curl http://localhost:8090/api/tickets
   curl http://localhost:8090/api/users
   ```

4. **Access the Application**
   - **Backend API**: http://localhost:8090/api
   - **Gateway**: http://localhost:8081/api
   - **Swagger UI**: http://localhost:8090/swagger-ui.html
   - **Keycloak Admin**: http://localhost:8180/admin
   - **Mailhog**: http://localhost:8025

### Demo Data

The application comes with pre-seeded demo data (dev profile only):

**Users:**
- `admin` / `admin@sav.com` (ADMIN role)
- `tech1` / `tech1@sav.com` (TECHNICIAN role)  
- `user1` / `user1@sav.com` (USER role)

**Sample Tickets:**
- Open ticket: "Login issues with new system" (HIGH priority)
- In-progress ticket: "Add user profile picture upload" (MEDIUM priority)
- Resolved ticket: "Database connection timeout" (CRITICAL priority)
- Closed ticket: "Update user documentation" (LOW priority)

### Environment Configuration

Copy the environment template and configure:
```bash
cp env.example .env
# Edit .env with your configuration
```

- **prod**: Uses environment variables

## 🔐 Authentication

### Keycloak Setup

1. Access Keycloak Admin Console: http://localhost:8180/admin
2. Login with: `admin` / `admin123`
3. Create realm `sav-realm`
4. Create client `sav-backend` with client secret
5. Create users with appropriate roles

### Default Credentials
- **Keycloak Admin**: admin / admin123
- **Database**: admin / admin123
- **PgAdmin**: admin@sav.com / admin123

## 📊 API Documentation

### Base URLs
- **Backend**: http://localhost:8090/api
- **Gateway**: http://localhost:8081/api (recommended)

### Authentication
All endpoints require JWT Bearer token except:
- `/actuator/**` - Health and monitoring
- `/debug/**` - Debug endpoints
- `/public/**` - Public resources

### Key Endpoints

#### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users` - List users (ADMIN only)

#### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets` - List tickets (TECHNICIAN/ADMIN)
- `GET /api/tickets/my-tickets` - Get user's tickets
- `GET /api/tickets/{id}` - Get ticket details
- `PUT /api/tickets/{id}` - Update ticket
- `POST /api/tickets/{id}/assign` - Assign ticket

## 🔧 Configuration

### Profiles
- **dev**: Development with local services
- **test**: Testing with H2 database
- **prod**: Production with environment variables

### Environment Variables
See `env.example` for all available configuration options.

## 📈 Monitoring

### Health Checks
- **Health**: http://localhost:8090/actuator/health
- **Info**: http://localhost:8090/actuator/info
- **Metrics**: http://localhost:8090/actuator/metrics

### Logging
- **Level**: Configurable per profile
- **Format**: Structured JSON in production
- **Trace IDs**: Included for request tracing

## 🚨 Smoke Tests

### Basic Health Check
```bash
curl http://localhost:8090/actuator/health
```

### Authentication Flow
```bash
# 1. Get token from Keycloak
TOKEN=$(curl -X POST http://localhost:8180/realms/sav-realm/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your-username&password=your-password&grant_type=password&client_id=sav-backend&client_secret=your-secret" \
  | jq -r '.access_token')

# 2. Test authenticated endpoint
curl -H "Authorization: Bearer $TOKEN" http://localhost:8090/api/users/me
```

### Core Functionality
```bash
# Create ticket
curl -X POST http://localhost:8090/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Ticket","description":"Test Description","type":"BUG","priority":"HIGH"}'

# List tickets
curl -H "Authorization: Bearer $TOKEN" http://localhost:8090/api/tickets
```

## 🛠️ Development

### Code Quality
- **Formatting**: Spotless (configured)
- **Linting**: Checkstyle (configured)

### Database Migrations
- **Tool**: Flyway
- **Location**: `application/src/main/resources/db/migration/`
- **Auto-apply**: In dev profile

### Adding New Features
1. Create domain module (if new bounded context)
2. Add API layer with controllers
3. Implement business logic in services
4. Add infrastructure layer for persistence
6. Update documentation

## 🚀 Deployment

### Docker
```bash
# Build image
docker build -t sav-backend .

# Run container
docker run -p 8090:8090 --env-file .env sav-backend
```

### Production Checklist
- [ ] Configure environment variables
- [ ] Set up SSL/TLS certificates
- [ ] Configure proper logging
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## 📝 API Examples

### Create User
```bash
curl -X POST http://localhost:8090/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john.doe",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }'
```

### Create Ticket
```bash
curl -X POST http://localhost:8090/api/tickets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login Issue",
    "description": "Cannot login to the system",
    "type": "BUG",
    "priority": "HIGH"
  }'
```

## 🚀 Future Work

The following features are planned for future releases:

### Advanced Security
- [ ] HTTPS/TLS configuration
- [ ] Advanced rate limiting with Redis
- [ ] JWT token refresh mechanism
- [ ] Multi-factor authentication

### Monitoring & Observability
- [ ] Micrometer metrics integration
- [ ] Prometheus metrics endpoint
- [ ] Distributed tracing with Zipkin
- [ ] Custom business metrics

### Notifications
- [ ] Email notification service
- [ ] Slack integration
- [ ] Push notifications
- [ ] SMS notifications

### Performance & Scalability
- [ ] Redis caching layer
- [ ] Database query optimization
- [ ] Connection pooling tuning
- [ ] Load balancing configuration


## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
5. Run quality checks
6. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: See INTEGRATION_GUIDE.md
- **Issues**: Create GitHub issue
- **Email**: support@sav.com
