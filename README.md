# NextGen Consulting Platform

A platform for online consultations with role-based access control and JWT authentication.

## Technologies

- **Spring Boot 3.5.7** for building the backend application
- **Spring Security** for authentication and authorization
- **JWT** for secure access and refresh tokens
- **JPA/Hibernate** for ORM and database access
- **PostgreSQL** as the primary relational database
- **Flyway** for database migrations
- **Lombok** for reducing boilerplate
- **Bean Validation** for request validation
- **MapStruct** for DTO and entity mapping
- **Clean Architecture** for clear application layering
- **JUnit 5** and **Mockito** for testing
- **H2** for in-memory tests
- **Spring Boot Actuator** for monitoring and health checks
- **Swagger / OpenAPI** for interactive API documentation
- **Audit Logging** for tracking important actions
- **Docker & Docker Compose** for containerized development and deployment

## Architecture

The project follows Clean Architecture principles:

```text
Controller Layer
  -> handles HTTP requests and responses
  -> returns DTOs
  -> implements API contract interfaces

Service Layer
  -> contains business rules and validation

Mapper Layer
  -> transforms entities and DTOs

Repository Layer
  -> works with the database through JPA

Database
  -> PostgreSQL
```

### Layers

1. **Controller API Interfaces** define Swagger/OpenAPI contracts.
2. **Controllers** handle HTTP concerns only.
3. **Services** contain business logic and validation.
4. **Mappers** convert entities to DTOs and back.
5. **Repositories** provide persistence access through JPA.
6. **Models** are JPA entities and are not returned directly from the API.
7. **DTOs** are used for API input and output.

### Benefits

- Clear separation of responsibilities
- Better testability
- Safer API boundaries
- Easier maintenance and extension
- Compile-time mapper generation with MapStruct
- Strong type safety
- Better null-handling support

## Creating the Admin Account

The admin account does not exist by default and must be created manually via SQL after the application has started at least once (so Flyway migrations run and the `users` table is created).

### Step 1 — Generate a BCrypt hash for your password

Use any BCrypt generator (cost factor 10) for your desired password. Example for `Admin@123`:

```
$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
```

Or generate one with Java:
```bash
# In the Spring Boot app console (Swagger or test endpoint)
# Or use: https://bcrypt-generator.com  (rounds = 10)
```

### Step 2 — Insert the admin user via SQL

Connect to PostgreSQL:
```bash
# If running via Docker
docker exec -it consulting_postgres psql -U consulting_user -d consulting_db

# If running locally
psql -U consulting_user -d consulting_db
```

Run the INSERT:
```sql
INSERT INTO users (id, full_name, phone, password_hash, role)
VALUES (
  uuid_generate_v4(),
  'Admin User',
  '+70000000001',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'ADMIN'
);
```

> The hash above is for password `password`. Replace it with your own BCrypt hash.

### Step 3 — Log in

```
Phone:    +70000000001
Password: password   (or whatever password you hashed)
```

### Notes

- The public `POST /api/auth/register` endpoint only allows `CLIENT` and `CONSULTANT` roles — it will never create an ADMIN through the UI, which is intentional for security.
- To change the admin's password later, generate a new BCrypt hash and run:
  ```sql
  UPDATE users SET password_hash = '<new_hash>' WHERE phone = '+70000000001';
  ```
- To create additional admins, repeat Step 2 with a different phone number.

---

## Setup and Run

The project consists of two parts:
- **Backend** — Spring Boot API (`localhost:8080`)
- **Frontend** — React/Vite app (`localhost:5173`)

---

### Step 1 — Start the Backend

#### Option A: Full Docker (recommended)

Builds and starts PostgreSQL, Redis, and the Spring Boot app:

```powershell
# Build and start all services
docker compose build app
docker compose up -d

# View backend logs
docker compose logs -f app

# Stop all services
docker compose down

# Stop and remove volumes (resets the database)
docker compose down -v
```

Backend available at `http://localhost:8080`.

#### Option B: Local App + Docker Databases

Run only the databases in Docker and start the app locally:

```powershell
# Start PostgreSQL and Redis only
docker compose -f docker-compose.dev.yml up -d

# Run the backend locally (requires Java 17+)
./gradlew bootRun
```

---

### Step 2 — Start the Frontend

```powershell
cd frontend
npm install      # first time only
npm run dev
```

Frontend available at `http://localhost:5173`.

> The frontend proxies API requests to `http://localhost:8080` automatically.

---

### Useful Docker Commands

```powershell
# Check service status
docker compose ps

# View logs for a specific service
docker compose logs -f app
docker compose logs -f postgres

# Rebuild the backend after code changes
docker compose build app
docker compose up -d app

# Open a PostgreSQL shell
docker exec -it consulting_postgres psql -U consulting_user -d consulting_db

# Open a Redis shell
docker exec -it consulting_redis redis-cli
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - register a user
- `POST /api/auth/login` - sign in and receive access and refresh tokens
- `POST /api/auth/refresh` - refresh the access token
- `POST /api/auth/logout` - sign out

### Users

- `GET /api/users/profile` - get the current user's profile
- `PUT /api/users/profile` - update the current user's profile
- `GET /api/users` - get all users, admin only
- `GET /api/users/{id}` - get a user by ID, admin only
- `PUT /api/users/{id}/role` - change a user role, admin only
- `DELETE /api/users/{id}` - delete a user, admin only

### Requests

- `POST /api/requests` - create a request, client only
- `GET /api/requests` - get all requests, admin only
- `GET /api/requests/my` - get my requests
- `GET /api/requests/pending` - get pending requests, consultant only
- `GET /api/requests/{id}` - get a request by ID
- `PUT /api/requests/{id}` - update a request
- `PUT /api/requests/{id}/status` - update request status, consultant only
- `DELETE /api/requests/{id}` - delete a request

### Consultants

- `POST /api/consultants` - create a consultant, admin only
- `GET /api/consultants` - get all consultants
- `GET /api/consultants/{id}` - get a consultant by ID
- `GET /api/consultants/by-user/{userId}` - get a consultant by user ID
- `PUT /api/consultants/{id}` - update a consultant
- `DELETE /api/consultants/{id}` - delete a consultant, admin only

### Contact Links

- `POST /api/contact-links` - create a contact link, consultant only
- `GET /api/contact-links` - get all contact links, admin only
- `GET /api/contact-links/consultant/{consultantId}` - get consultant contact links
- `GET /api/contact-links/{id}` - get a contact link by ID
- `PUT /api/contact-links/{id}` - update a contact link
- `DELETE /api/contact-links/{id}` - delete a contact link

### Notifications

- `POST /api/notifications` - create a notification, admin only
- `GET /api/notifications` - get my notifications
- `GET /api/notifications/unread` - get unread notifications
- `GET /api/notifications/{id}` - get a notification by ID
- `PUT /api/notifications/{id}/read` - mark a notification as read
- `PUT /api/notifications/{id}` - update a notification, admin only
- `DELETE /api/notifications/{id}` - delete a notification
- `DELETE /api/notifications/user/{userId}` - delete all notifications for a user, admin only

### Achievements

- `POST /api/achievements` - create an achievement, admin only
- `GET /api/achievements` - get all achievements, admin only
- `GET /api/achievements/my` - get my achievements
- `GET /api/achievements/user/{userId}` - get a user's achievements
- `GET /api/achievements/{id}` - get an achievement by ID
- `PUT /api/achievements/{id}` - update an achievement, admin only
- `DELETE /api/achievements/{id}` - delete an achievement, admin only

## User Roles

- **CLIENT** can create consultation requests
- **CONSULTANT** can process requests
- **ADMIN** has full system access

## Database Structure

### Main Tables

- `users`
- `consultants`
- `requests`
- `notifications`
- `achievements`
- `user_sessions`
- `audit_logs`
- `contact_links`

## Security

- JWT-based authentication
- Role-based access control through Spring Security
- CORS enabled for configured origins
- BCrypt password hashing
- Passwords are never returned in JSON responses

## Error Handling

The API returns standardized error responses:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 404,
  "error": "Resource Not Found",
  "message": "User not found with id: '123e4567-e89b-12d3-a456-426614174000'",
  "path": "/api/users/123e4567-e89b-12d3-a456-426614174000"
}
```

Validation failures also include field details:

```json
{
  "timestamp": "2024-01-15T10:30:00",
  "status": 400,
  "error": "Validation Failed",
  "message": "Data validation failed",
  "path": "/api/auth/register",
  "validationErrors": {
    "email": "Email must be valid",
    "password": "Password must be between 6 and 20 characters"
  }
}
```

## Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "fullName": "John Smith",
    "phone": "+79991234567"
  }'
```

### 2. Sign In

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "tokenType": "Bearer"
}
```

### 3. Refresh Token

```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 4. Sign Out

```bash
curl -X POST http://localhost:8080/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 5. Get Profile

```bash
curl -X GET http://localhost:8080/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 6. Create a Request

```bash
curl -X POST http://localhost:8080/api/requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Need help with Spring Boot",
    "description": "I want to learn Spring Boot from scratch"
  }'
```

### 7. Update Request Status

```bash
curl -X PUT "http://localhost:8080/api/requests/{id}/status?status=COMPLETED&comment=Work completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Migrations

Flyway migrations run automatically when the application starts. The initial migration file is located at `src/main/resources/db/migration/V1__create_nextgen_schema.sql`.

## MapStruct

The project uses MapStruct to generate entity and DTO mappers at compile time.

### Example

```java
@Service
public class UserService {
    private final UserMapper userMapper;

    public UserDto getUser(UUID id) {
        User entity = repository.findById(id);
        return userMapper.toDto(entity);
    }
}
```

### Generated Mappers

Generated implementations are available under `build/generated/sources/annotationProcessor/`, for example:

- `UserMapperImpl.java`
- `ConsultantMapperImpl.java`
- `RequestMapperImpl.java`
- `NotificationMapperImpl.java`
- `ContactLinkMapperImpl.java`
- `AchievementMapperImpl.java`

## Testing

The project includes unit and integration tests.

### Run Tests

```bash
# Run all tests
./gradlew test

# Run only service tests
./gradlew test --tests "*ServiceTest"

# Run only controller tests
./gradlew test --tests "*ControllerTest"
```

Test reports are generated in `build/reports/tests/test/index.html`.

## Swagger / OpenAPI

Interactive API documentation is available at:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

## Monitoring

Spring Boot Actuator endpoints:

- `GET /actuator/health`
- `GET /actuator/metrics`
- `GET /actuator/info`

## Logging

Application logs are stored in `logs/consulting.log`.

Audit logs capture critical actions such as:

- successful sign-ins
- registrations
- user data changes
- security events
- request IP addresses
- operation timestamps

Example usage:

```java
@Autowired
private AuditLogService auditLogService;

auditLogService.logUserAction("LOGIN", "User logged in successfully");
auditLogService.logEntityAction("UPDATE", "User", userId);
auditLogService.logSecurityEvent("FAILED_LOGIN", "Invalid credentials");
```

## Docker

The project is ready for Docker-based deployment.

### Files

- `Dockerfile` for the multi-stage Spring Boot image build
- `docker-compose.yml` for the full stack
- `docker-compose.dev.yml` for development databases only
- `.dockerignore` for image size optimization

### Highlights

- multi-stage build
- health checks
- automatic Flyway migrations
- persistent volumes
- isolated service network
- non-root runtime user
