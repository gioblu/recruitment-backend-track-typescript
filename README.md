# Invoice Management API

## Overview

This is a **Dockerized TypeScript-based Invoice Management API** that provides endpoints to manage users, tax profiles, and invoices. Built with Express.js using the MVC architecture, it includes automated tests, complete Docker support, and auto-generated OpenAPI/Swagger documentation. This software is just an evaluation exercise for candidates willing to test their back-end capabilities. Do not use this in production!  

**Key Features:**
- ✅ Complete CRUD operations for Users, Tax Profiles, and Invoices 
- ✅ JWT authentication with password hashing (basic, not production ready)
- ✅ Pagination and filtering 
- ✅ 36 integration tests with fixtures
- ✅ Logging and error handling
- ✅ Rate limiting and graceful shutdown 
- ✅ Multi-stage Docker build for minimal image size 
- ✅ Auto-generated OpenAPI/Swagger documentation
- ✅ Prisma ORM with PostgreSQL database

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Project Structure](#project-structure)
3. [Getting Started](#getting-started)
4. [Docker Environment](#docker-environment)
5. [API Endpoints](#api-endpoints)
6. [Pagination & Filtering](#pagination--filtering)
7. [Authentication](#authentication)
8. [Database Schema](#database-schema)
9. [Testing](#testing)
10. [Logging & Error Handling](#logging--error-handling)
11. [Security](#security)
12. [Troubleshooting](#troubleshooting)

---

## Technology Stack

- **Backend Framework:** Express.js, TypeScript, Node.js
- **Database & ORM:** PostgreSQL, Prisma, Prisma Client
- **Authentication & Security:** jsonwebtoken, bcryptjs, cookie-parser
- **Logging & Monitoring:** pino, pino-http, pino-pretty
- **API Documentation:** swagger-ui-express, zod-openapi
- **Validation:** zod, express-rate-limit
- **Testing:** Jest, ts-jest, supertest
- **Infrastructure:** Docker, Docker Compose, Nginx

---

## Project Structure

```
invoice-management-api/
├── src/                              # Source code
│   ├── index.ts                     # Express server entry point
│   ├── prisma.ts                    # Prisma client instance
│   │
│   ├── auth/
│   │   └── auth.utils.ts            # JWT & password utilities
│   │
│   ├── controllers/                 # Request handlers (MVC Controller)
│   │   ├── auth.controller.ts       # Authentication logic
│   │   ├── user.controller.ts       # User CRUD operations
│   │   ├── invoice.controller.ts    # Invoice CRUD operations
│   │   └── taxProfile.controller.ts # Tax profile CRUD operations
│   │
│   ├── routes/                      # API route definitions
│   │   ├── auth.routes.ts           # Authentication endpoints
│   │   ├── user.routes.ts           # User endpoints
│   │   ├── invoice.routes.ts        # Invoice endpoints
│   │   └── taxProfile.routes.ts     # Tax profile endpoints
│   │
│   ├── schemas/                     # Zod validation schemas
│   │   ├── user.schema.ts           # User request/response schemas
│   │   ├── invoice.schema.ts        # Invoice schemas
│   │   └── taxProfile.schema.ts     # Tax profile schemas
│   │
│   ├── services/                    # Data access layer (MVC Model)
│   │   └── user.service.ts          # User repository methods
│   │
│   ├── utils/                       # Utility functions
│   │   ├── logger.ts                # Pino logging configuration
│   │   ├── responses.ts             # Standardized response formatters
│   │   ├── validators.ts            # Input validation helpers
│   │   └── pagination.ts            # Pagination utilities
│   │
│   ├── openapi/
│   │   └── spec.ts                  # OpenAPI/Swagger specification
│   │
│   └── types/
│       └── express.d.ts             # TypeScript Express augmentation
│
├── prisma/                          # Prisma configuration
│   ├── schema.prisma                # Database schema definition
│   └── migrations/                  # Database migrations
│       └── [timestamp]_init/        # Initial schema migration
│
├── tests/                           # Test suite
│   ├── jest.setup.ts                # Jest setup with DB retry logic
│   ├── fixtures.ts                  # Test data factories
│   └── unit/
│       ├── auth.controller.int.test.ts          # 5 auth tests
│       ├── user.controller.int.test.ts          # 5 user tests
│       ├── invoice.controller.int.test.ts       # 5 invoice tests
│       ├── taxProfile.controller.int.test.ts    # 5 tax profile tests
│       └── rate-limiter.test.ts                 # 1 rate limiter test
│
├── dist/                            # Compiled JavaScript (generated)
├── coverage/                        # Test coverage reports (generated)
│
├── Dockerfile                       # Multi-stage Docker build
├── docker-compose.yml               # Service orchestration
├── nginx.conf                       # Nginx reverse proxy config
│
├── .env                             # Environment variables (not in git)
├── .env.example                     # Example environment template
├── .env.test                        # Test environment config
│
├── jest.config.js                   # Jest test configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Dependencies and scripts
├── package-lock.json                # Dependency lock file
│
└── README.md                        # This file
```

### Architecture Explanation

**MVC Pattern Implementation:**
- **Model** - `src/services/` & `prisma/schema.prisma` - Data access and relationships
- **View** - Response formatters in `src/utils/responses.ts` - Consistent API responses
- **Controller** - `src/controllers/` - Request handling and business logic

**Separation of Concerns:**
- Routes handle URL mapping
- Controllers handle HTTP logic
- Services handle data access
- Schemas handle validation
- Utils handle reusable functions

---

## Getting Started

### Prerequisites

- Docker and Docker Compose installed
- OR: Node.js 20+, PostgreSQL 15, npm

### Option 1: Using Docker (Recommended)

#### 1. Clone the Repository

```bash
git clone https://github.com/gioblu/recruitment-backend-track-typescript
cd recruitment-backend-track-typescript
```

#### 2. Create Environment Files

```bash
# Copy the example environment file
cp .env.example .env
cp .env.example .env.test

# Update .env with your configuration (if needed)
# Default values work for local development
```

**Default `.env` Configuration:**
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://postgres:password@db:5432/invoice_db
JWT_SECRET=your-secret-key-change-in-production
LOG_LEVEL=debug
FRONTEND_URL=http://localhost:3000
```

#### 3. Build and Start Containers

```bash
# Build images and start all services
docker-compose up --build

# Output will show:
# - Backend API on http://localhost:3000
# - Nginx on http://localhost:80 (proxies to backend)
# - Swagger UI on http://localhost:3000/api-docs
# - pgAdmin on http://localhost:5050 (optional)
```

#### 4. Verify Services Are Running

```bash
# In another terminal, check service status
docker-compose ps

# Output should show:
# - invoice-backend (running)
# - invoice-db (running, healthy)
# - invoice-backend-test (completed)
# - invoice-db-test (running, healthy)
# - invoice-nginx (running)
```

#### 5. Access the Application

- **API Root**: `http://localhost:3000`
- **API Docs (Swagger UI)**: `http://localhost:3000/api-docs`
- **OpenAPI Spec (JSON)**: `http://localhost:3000/api-docs/swagger.json`
- **Health Check**: `http://localhost:3000/health`
- **Nginx Proxy**: `http://localhost` (redirects to localhost:3000)

### Option 2: Local Development (without Docker)

#### 1. Install Dependencies

```bash
npm install
```

#### 2. Set Up PostgreSQL

```bash
# Create databases
createdb invoice_db
createdb invoice_test_db

# Update .env and .env.test with local database URLs
DATABASE_URL=postgresql://postgres:password@localhost:5432/invoice_db
```

#### 3. Run Migrations

```bash
npx prisma migrate deploy
```

#### 4. Start Development Server

```bash
npm run dev

# Server runs on http://localhost:3000
```

#### 5. Run Tests

```bash
npm test              # Run all tests
npm run test:coverage # Run with coverage report
```

---

## Docker Environment

### Multi-Stage Dockerfile

The `Dockerfile` uses a two-stage build to minimize production image size:

#### Builder Stage
```dockerfile
FROM node:20 AS builder
# - Installs all dependencies (dev + prod)
# - Generates Prisma client
# - Compiles TypeScript to JavaScript
# Result: ~2GB of build artifacts
```

#### Runtime Stage
```dockerfile
FROM node:20-alpine AS runtime
# - Copies only compiled code
# - Copies only production dependencies
# - Includes Prisma schema for migrations
# Result: ~350MB production-ready image
```

**Benefits:**
- Reduced image size (6x smaller)
- No build tools in production (security)
- Faster deployments
- Smaller attack surface

### Docker Compose Services

#### Production Network (`prod`)

**Service: `backend`**
- Express.js API server
- Runs migrations on startup
- Port: 3000 (internal), 3000 (external)
- Depends on: `db` (healthy)
- Auto-restart on failure

**Service: `db`**
- PostgreSQL 15-alpine database
- Volume: `pgdata` (persistent storage)
- Environment: 
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=password
  - POSTGRES_DB=invoice_db
- Health check: `pg_isready` (5s interval)
- Port: 5432 (external)

**Service: `nginx`**
- Nginx reverse proxy
- Forwards traffic from port 80 → backend:3000
- Config: `nginx.conf`
- Port: 80

#### Test Network (`test`)

**Service: `backend-test`**
- Test runner container
- Runs migrations then Jest tests
- Depends on: `test-db` (healthy)
- Exits after tests complete (restart: "no")
- No ports exposed

**Service: `test-db`**
- Isolated PostgreSQL for testing
- Volume: `test-pgdata` (fresh for each run)
- Health check: Same as production
- Not exposed to external ports

#### Optional Service

**Service: `pgadmin` (commented out)**
- Web UI for database management
- Access: http://localhost:5050
- User: dev@example.com
- Pass: devpass

### Volume Configuration

```yaml
volumes:
  pgdata:        # Production database persistence
  test-pgdata:   # Test database (isolated)
```

**Persistence:**
- Data survives container restarts
- Data persists across deployments
- Clean with: `docker compose down -v` (removes volumes)

### Health Checks

Both databases include health checks using `pg_isready`:

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d invoice_db"]
  interval: 5s      # Check every 5 seconds
  timeout: 5s       # Timeout if no response in 5s
  retries: 5        # Fail after 5 retries
  start_period: 10s # Wait 10s before first check
```

**Dependency Condition:**
```yaml
depends_on:
  db:
    condition: service_healthy  # Wait until DB is ready
```

This ensures the backend doesn't start until PostgreSQL is fully initialized.

---

## API Endpoints

### Authentication Endpoints

#### Register New User

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

**Error Responses:**
- `400` - Validation failed (invalid email format, weak password)
- `409` - Email already registered

#### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

**Error Responses:**
- `401` - Invalid email or password

#### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "message": "Logged out"
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

---

### User Endpoints

All user endpoints require authentication (JWT token in cookie or Authorization header).

#### Create User

```http
POST /api/user
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "Password123",
  "name": "Jane Smith"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "createdAt": "2025-11-06T12:34:56.000Z",
    "updatedAt": "2025-11-06T12:34:56.000Z"
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

#### Get User

```http
GET /api/user/:id
Authorization: Bearer <token>
```

**Example:** `GET /api/user/1`

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2025-11-06T10:00:00.000Z",
    "updatedAt": "2025-11-06T12:34:56.000Z"
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

**Error Responses:**
- `404` - User not found
- `400` - Invalid user ID format

#### Update User

```http
PATCH /api/user/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Updated",
  "password": "NewPassword123"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Updated",
    "updatedAt": "2025-11-06T12:45:00.000Z"
  },
  "timestamp": "2025-11-06T12:45:00.000Z"
}
```

#### Delete User

```http
DELETE /api/user/:id
Authorization: Bearer <token>
```

**Response (204 No Content):**
```
(empty response body)
```

#### List Users

```http
GET /api/user?page=1&limit=10&email=john&name=doe
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `email` (optional) - Filter by email substring
- `name` (optional) - Filter by name substring

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "page": 1,
    "limit": 10,
    "data": [
      {
        "id": 1,
        "email": "user@example.com",
        "name": "John Doe",
        "createdAt": "2025-11-06T10:00:00.000Z",
        "updatedAt": "2025-11-06T12:34:56.000Z"
      }
    ]
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

---

### Tax Profile Endpoints

#### Create Tax Profile

```http
POST /api/taxProfiles
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": 1,
  "name": "Primary Business",
  "tax_id_number": "US12-3456789",
  "address": "123 Business Avenue, New York, NY 10001, USA"
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "name": "Primary Business",
    "tax_id_number": "US12-3456789",
    "address": "123 Business Avenue, New York, NY 10001, USA",
    "createdAt": "2025-11-06T12:34:56.000Z",
    "updatedAt": "2025-11-06T12:34:56.000Z"
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

**Note:** Tax profiles store tax identification and business address information for invoice generation.

#### Get Tax Profile

```http
GET /api/taxProfiles/:id
Authorization: Bearer <token>
```

#### Update Tax Profile

```http
PATCH /api/taxProfiles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Primary Business - Updated",
  "address": "456 Commerce Plaza, Boston, MA 02101, USA"
}
```

#### Delete Tax Profile

```http
DELETE /api/taxProfiles/:id
Authorization: Bearer <token>
```

**Response (204 No Content)**

#### List Tax Profiles

```http
GET /api/taxProfiles?page=1&limit=10&userId=1&tax_id_number=US12&name=Primary
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `userId` (optional) - Filter by user ID
- `name` (optional) - Filter by name substring
- `tax_id_number` (optional) - Filter by tax ID number substring

---

### Invoice Endpoints

#### Create Invoice

```http
POST /api/invoices
Authorization: Bearer <token>
Content-Type: application/json

{
  "taxProfileId": 1,
  "amount": 1500.50,
  "status": "draft"
}
```

**Valid Status Values:** `draft`, `sent`, `paid`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "taxProfileId": 1,
    "amount": "1500.50",
    "status": "draft",
    "issuedAt": "2025-11-06T12:34:56.000Z"
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

#### Get Invoice

```http
GET /api/invoices/:id
Authorization: Bearer <token>
```

#### Update Invoice

```http
PATCH /api/invoices/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "sent",
  "amount": 1600.75
}
```

#### Delete Invoice

```http
DELETE /api/invoices/:id
Authorization: Bearer <token>
```

#### List Invoices

```http
GET /api/invoices?page=1&limit=10&status=sent&minAmount=1000&maxAmount=5000&email=user
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `limit` (optional, default: 10) - Items per page
- `status` (optional) - Filter by status: `draft`, `sent`, `paid`
- `email` (optional) - Filter by user email
- `minAmount` (optional) - Minimum invoice amount
- `maxAmount` (optional) - Maximum invoice amount

---

## Pagination & Filtering

### Pagination

All list endpoints support pagination via query parameters:

```http
GET /api/user?page=2&limit=20
```

**Parameters:**
- `page` - Page number (1-indexed, default: 1)
- `limit` - Items per page (default: 10, max: typically 100)

**Response Format:**
```json
{
  "success": true,
  "data": {
    "page": 2,
    "limit": 20,
    "total": 157,
    "data": [...]
  },
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```

**Calculating Pages:**
- Total pages = `Math.ceil(total / limit)`
- Skip = `(page - 1) * limit`
- Next page exists if: `page * limit < total`

### Filtering

#### User Filters

```http
GET /api/user?email=john&name=doe
```

- `email` - Substring match (case-insensitive)
- `name` - Substring match (case-insensitive)

**Example Queries:**
```http
# Find all users with "john" in email
GET /api/user?email=john

# Find all users with "smith" in name
GET /api/user?name=smith

# Combine filters
GET /api/user?email=example&name=john&page=1&limit=5
```

#### Tax Profile Filters

```http
GET /api/taxProfiles?name=Primary&userId=1&tax_id_number=US12
```

- `name` - Substring match
- `userId` - Exact match (numeric ID)
- `tax_id_number` - Substring match

#### Invoice Filters

```http
GET /api/invoices?status=sent&email=user&minAmount=500&maxAmount=5000
```

- `status` - Exact match: `draft`, `sent`, `paid`
- `email` - User email substring match
- `minAmount` - Minimum amount (inclusive, Decimal)
- `maxAmount` - Maximum amount (inclusive, Decimal)

**Examples:**
```http
# Get all sent invoices
GET /api/invoices?status=sent

# Get invoices between 1000 and 10000
GET /api/invoices?minAmount=1000&maxAmount=10000

# Get paid invoices from user with "smith" in email
GET /api/invoices?status=paid&email=smith

# Complex: Page 2, 20 items, filtered
GET /api/invoices?page=2&limit=20&status=draft&minAmount=100
```

---

## Authentication

### JWT Token

The API uses **JSON Web Tokens (JWT)** for authentication:

- **Algorithm:** HS256 (HMAC-SHA256)
- **Expiration:** 1 hour
- **Payload:** `{ sub: userId }`

### Token Storage

Tokens are stored in **HTTP-only cookies** for security:

```
Set-Cookie: access_token=<jwt_token>; 
    HttpOnly; 
    Secure (in production); 
    SameSite=Strict; 
    Max-Age=3600
```

### Token Usage

**Option 1: Cookie (Automatic)**
```http
GET /api/user
# Token sent automatically with request
```

**Option 2: Authorization Header**
```http
GET /api/user
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### Protected Routes

All endpoints except `/api/auth/register` and `/api/auth/login` require authentication:

```http
GET /api/user               # ❌ Requires token
POST /api/auth/login        # ✅ Public
POST /api/auth/register     # ✅ Public
DELETE /api/invoices/1      # ❌ Requires token
```

### Error Handling

**Missing Token:**
```json
{
  "success": false,
  "error": "Missing token",
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```
Status: 401 Unauthorized

**Invalid/Expired Token:**
```json
{
  "success": false,
  "error": "Invalid token",
  "timestamp": "2025-11-06T12:34:56.000Z"
}
```
Status: 401 Unauthorized

---

## Database Schema

### Entity Relationship Diagram

```
User (1) ──── (N) TaxProfile (1) ──── (N) Invoice
  id              id                      id
  email           userId (FK)             taxProfileId (FK)
  password        name                    amount
  name            rate                    status
  createdAt       createdAt               issuedAt
  updatedAt       updatedAt
```

### Tables

#### `users` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| `password` | VARCHAR(255) | NOT NULL | Hashed password (bcrypt) |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updatedAt` | TIMESTAMP | AUTO_UPDATE | Last modification time |

**Indexes:**
- Primary Key: `id`
- Unique: `email`

#### `tax_profiles` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique tax profile ID |
| `userId` | INT | FK → users.id | Associated user |
| `name` | VARCHAR(255) | NOT NULL | Tax profile name |
| `tax_id_number` | VARCHAR(30) | NOT NULL | Tax identification number (e.g., VAT/TIN/EIN) |
| `address` | TEXT | NOT NULL | Business or physical address |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |
| `updatedAt` | TIMESTAMP | AUTO_UPDATE | Last modification time |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `userId` → `users.id`

#### `invoices` Table

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INT | PK, AUTO_INCREMENT | Unique invoice ID |
| `taxProfileId` | INT | FK → tax_profiles.id | Associated tax profile |
| `amount` | DECIMAL(12,2) | NOT NULL | Invoice amount |
| `status` | VARCHAR(50) | DEFAULT 'draft' | `draft`, `sent`, or `paid` |
| `issuedAt` | TIMESTAMP | DEFAULT NOW() | Invoice issue date |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `taxProfileId` → `tax_profiles.id`

### Relationships

**User → TaxProfile (1:N)**
- One user can have multiple tax profiles
- Foreign key: `tax_profiles.userId` → `users.id`
- Cascade on delete: TaxProfiles deleted if user deleted

**TaxProfile → Invoice (1:N)**
- One tax profile can have multiple invoices
- Foreign key: `invoices.taxProfileId` → `tax_profiles.id`
- Cascade on delete: Invoices deleted if profile deleted

### Data Integrity

- **Referential Integrity:** Foreign keys enforce relationships with CASCADE delete
- **Unique Constraints:** Email addresses must be unique
- **Validation:** 
  - Tax ID numbers: 5-30 characters, alphanumeric with hyphens
  - Addresses: 10-255 characters
  - Decimal Precision: Financial amounts use DECIMAL(12,2) for cents precision

---

## Testing

### Test Suite Overview

**Total Tests:** 36 integration tests
**Framework:** Jest with ts-jest
**Database:** Isolated test database with fresh state

```
tests/unit/
├── auth.controller.int.test.ts       (5 tests)
├── user.controller.int.test.ts       (5 tests)
├── invoice.controller.int.test.ts    (5 tests)
├── taxProfile.controller.int.test.ts (5 tests)
└── rate-limiter.test.ts              (1 test)
```

### Running Tests

#### Docker (Recommended)

```bash
# Run tests in Docker
docker-compose up

# View test output
docker-compose logs backend-test

# Run tests with coverage
docker-compose run --rm backend npx jest --coverage
```

#### Local

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.controller.int.test.ts

# Run in watch mode (development)
npm test -- --watch
```

### Test Coverage

**Current Thresholds:**
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

**Generate Coverage Report:**
```bash
npm run test:coverage

# View HTML report
open coverage/lcov-report/index.html
```

**Coverage Reports:**
- `coverage/index.html` - Summary
- `coverage/lcov-report/` - Detailed by file
- `coverage/lcov.info` - LCOV format

### Test Fixtures

Test fixtures provide consistent test data:

```typescript
// tests/fixtures.ts

export const createTestUser = async (data?: Partial<User>) => {
  return prisma.user.create({
    data: {
      email: data?.email || "test@example.com",
      password: hashPassword("password123"),
      name: data?.name || "Test User",
      ...data,
    },
  });
};

export const createTestTaxProfile = async (userId: number) => {
  return prisma.taxProfile.create({
    data: {
      userId,
      name: "Test Tax Profile",
      rate: new Prisma.Decimal("21"),
    },
  });
};
```

### Test Examples

#### Authentication Tests

```typescript
describe("Authentication", () => {
  it("should register a new user", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "newuser@example.com",
        password: "Password123",
        name: "Test User",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it("should reject duplicate email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        email: "existing@example.com",
        password: "Password123",
        name: "User",
      });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe("Email already used");
  });
});
```

#### CRUD Tests

```typescript
describe("User CRUD", () => {
  it("should create a user", async () => {
    const res = await request(app)
      .post("/api/user")
      .set("Authorization", `Bearer ${token}`)
      .send({
        email: "newuser@example.com",
        password: "Pass123",
        name: "John Doe",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBeDefined();
  });

  it("should retrieve user by ID", async () => {
    const res = await request(app)
      .get(`/api/user/${userId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });

  it("should list users with pagination", async () => {
    const res = await request(app)
      .get("/api/user?page=1&limit=10")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(1);
    expect(Array.isArray(res.body.data.data)).toBe(true);
  });
});
```

#### Relationship Tests

```typescript
it("should maintain user -> tax profile -> invoice relationships", async () => {
  // Create user
  const user = await createTestUser();
  
  // Create tax profile linked to user
  const profile = await createTestTaxProfile(user.id);
  
  // Create invoice linked to tax profile
  const invoice = await createTestInvoice(profile.id);
  
  // Verify relationships
  expect(profile.userId).toBe(user.id);
  expect(invoice.taxProfileId).toBe(profile.id);
  
  // Delete user should cascade
  await prisma.user.delete({ where: { id: user.id } });
  
  // Verify cascade delete
  const deletedProfile = await prisma.taxProfile.findUnique({
    where: { id: profile.id },
  });
  expect(deletedProfile).toBeNull();
});
```

---

## Logging & Error Handling

### Logging System

**Framework:** Pino (structured JSON logging)

#### Environment-Aware Configuration

**Development:**
- Pretty-printed with colors
- Includes timestamp and request ID
- Log level: debug

**Production:**
- Structured JSON format
- Optimized for log aggregation
- Log level: info

#### Log Levels

```typescript
logError()   // ERROR - System errors, exceptions
logWarn()    // WARN  - Warnings, deprecations
logInfo()    // INFO  - Important events
logDebug()   // DEBUG - Detailed diagnostics
```

#### Log Types

**Request Logging:**
```json
{
  "level": 30,
  "time": "2025-11-06T12:34:56.000Z",
  "pid": 1,
  "hostname": "container",
  "req": {
    "method": "POST",
    "url": "/api/user",
    "id": "1234567890"
  },
  "msg": "request"
}
```

**Authentication Events:**
```json
{
  "level": 30,
  "time": "2025-11-06T12:34:56.000Z",
  "type": "auth",
  "event": "login",
  "email": "user@example.com",
  "success": true,
  "userId": 1,
  "msg": "Auth login: user@example.com"
}
```

**Error Logging:**
```json
{
  "level": 50,
  "time": "2025-11-06T12:34:56.000Z",
  "err": {
    "type": "Error",
    "message": "Database connection failed",
    "stack": "Error: ...\n    at ..."
  },
  "userId": 1,
  "msg": "Unhandled request error"
}
```

**Database Operations:**
```json
{
  "level": 20,
  "time": "2025-11-06T12:34:56.000Z",
  "type": "database",
  "operation": "INSERT",
  "table": "users",
  "duration": "45ms",
  "msg": "DB INSERT on users"
}
```

#### Viewing Logs

**Docker:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Since specific time
docker-compose logs --since 2025-11-06T12:00:00 backend
```

**Local:**
```bash
# Development with pretty-print
npm run dev

# Production JSON logs
NODE_ENV=production npm start
```

### Error Handling

#### Global Error Middleware

All unhandled errors are caught and logged:

```typescript
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  const errorId = Date.now().toString();
  
  logError('Unhandled request error', err, {
    errorId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.user?.sub,
  });
  
  return sendError(res, 'Internal server error', 500, req, { errorId });
});
```

**Features:**
- Unique error ID for support reference
- Full error context logged
- Standardized error response
- Request ID included for tracing

#### 404 Handler

```typescript
app.use((req: Request, res: Response) => {
  return sendError(res, 'Not found', 404, req);
});
```

#### Prisma Error Handling

**Constraint Violations (P2002):**
```typescript
if (err.code === 'P2002' && err.meta?.target?.includes('email')) {
  return sendError(res, 'Email already used', 409, req);
}
```

**Record Not Found (P2025):**
```typescript
if (err.code === 'P2025') {
  return sendError(res, 'Not found', 404, req);
}
```

#### Process-Level Handlers

**Unhandled Rejections:**
```typescript
process.on('unhandledRejection', (reason, promise) => {
  logError('Unhandled Rejection', new Error(String(reason)));
  process.exit(1);
});
```

**Uncaught Exceptions:**
```typescript
process.on('uncaughtException', (err) => {
  logError('Uncaught Exception', err);
  process.exit(1);
});
```

### Error Response Format

```json
{
  "success": false,
  "error": "Email already used",
  "timestamp": "2025-11-06T12:34:56.000Z",
  "requestId": "unique-request-id",
  "errorId": "1234567890"
}
```

**Fields:**
- `success` - Always false
- `error` - Human-readable error message
- `timestamp` - ISO 8601 timestamp
- `requestId` - Request correlation ID
- `errorId` - Error tracking ID for support

---

## Security

### Password Security

**Hashing Algorithm:** bcryptjs
**SALT_ROUNDS:** 10 (approximately 100ms per hash)

**Process:**
```typescript
// Registration
const hashedPassword = hashPassword(plaintext);
await user.create({ password: hashedPassword });

// Login
const isValid = comparePassword(plaintext, hash);
```

**Bcrypt Features:**
- Automatically generates random salt
- Resistant to rainbow tables
- Slows down by default (cost factor)
- Future-proof: can increase rounds

### JWT Security

**Token Generation:**
```typescript
const token = jwt.sign(
  { sub: userId },
  process.env.JWT_SECRET,
  { expiresIn: '1h' }
);
```

**Token Validation:**
```typescript
const payload = jwt.verify(token, process.env.JWT_SECRET);
```

**Cookie Storage:**
```typescript
res.cookie('access_token', token, {
  httpOnly: true,        // JavaScript can't access
  secure: isProd,        // HTTPS only in production
  sameSite: 'strict',    // CSRF protection
  maxAge: 3600000,       // 1 hour
});
```

### XSS Protection

- **HTTP-Only Cookies:** Token not accessible via JavaScript
- **CSRF Tokens:** SameSite cookies prevent cross-site requests
- **Input Validation:** Zod schemas validate all inputs
- **Output Encoding:** All responses JSON-encoded

### CORS Configuration

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.FRONTEND_URL
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

**Development:** All origins allowed
**Production:** Only FRONTEND_URL allowed

### Rate Limiting

```typescript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per IP
  message: 'Too many requests, please try again later.',
  standardHeaders: true,      // Send rate limit headers
  legacyHeaders: false,       // Disable X-RateLimit-*
});

app.use('/api/', limiter);
```

**Response Headers:**
```
RateLimit-Limit: 100
RateLimit-Remaining: 92
RateLimit-Reset: 1699271696
```

### Environment Variables

**Production Security:**
```env
NODE_ENV=production
JWT_SECRET=use-strong-random-secret-min-32-chars
DATABASE_URL=postgresql://user:password@host:5432/db
```

**Never Commit:**
- `.env` (production secrets)
- API keys
- Passwords
- Private keys

---

## Common Commands

### Docker Commands

```bash
# Build images
docker-compose build

# Start services
docker-compose up
docker-compose up -d              # Detached mode

# Stop services
docker-compose down
docker-compose down -v            # Remove volumes

# View logs
docker-compose logs -f backend
docker-compose logs backend-test  # See test results

# Execute command in container
docker-compose exec backend sh
docker-compose exec db psql -U postgres

# Rebuild specific service
docker-compose build backend
docker-compose up backend
```

### Database Commands

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Create new migration
docker-compose exec backend npx prisma migrate dev --name add_column

# View database
docker-compose exec db psql -U postgres -d invoice_db

# List tables
psql> \dt

# Describe table
psql> \d users

# Exit psql
psql> \q
```

### Testing Commands

```bash
# Run tests
docker-compose up

# View test output
docker-compose logs backend-test

# Run tests locally
npm test
npm test -- --watch
npm test -- auth.controller.int.test.ts

# Generate coverage
npm run test:coverage
```

### Development Commands

```bash
# Start dev server
npm run dev

# Build TypeScript
npm run build

# Start production
npm start

# Rebuild and restart
npm run build && npm start
```

---

## Troubleshooting

### Database Connection Issues

**Problem:** `Error: connect ECONNREFUSED`

**Solution:**
```bash
# Check database is running
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db

# Wait for health check
docker-compose up --wait
```

### Port Already in Use

**Problem:** `Error: listen EADDRINUSE :::3000`

**Solution:**
```bash
# Find process using port
lsof -i :3000

# Kill process
kill -9 <PID>

# OR change port in .env
PORT=3001
```

### Tests Failing

**Problem:** Tests fail locally but pass in Docker

**Solution:**
```bash
# Use Docker for consistent environment
docker-compose up

# OR ensure database is fresh
npm run test:coverage  # Uses fresh database
```

### Migration Failed

**Problem:** `Migration failed: ..."

**Solution:**
```bash
# Check migrations
npx prisma migrate status

# Recover failed migration
npx prisma migrate resolve --rolled-back <migration-name>

# Redeploy
npx prisma migrate deploy
```

### TypeScript Compilation Error

**Problem:** `tsc error`

**Solution:**
```bash
# Rebuild
npm run build

# Check types
npx tsc --noEmit

# View detailed errors
npm run build 2>&1 | head -50
```

### Swagger UI Not Loading

**Problem:** `/api-docs` shows blank page

**Solution:**
```bash
# Verify server is running
curl http://localhost:3000/health

# Check OpenAPI spec
curl http://localhost:3000/api-docs/swagger.json

# Restart server
docker-compose restart backend
```

---

## Performance Optimization

### Database Queries

- **Indexes:** Indexed on PK and FK for fast lookups
- **Pagination:** Prevents loading entire datasets
- **Filtering:** Early filtering reduces data transfer
- **Connections:** Connection pooling via Prisma

### Caching Strategies

- **Browser Cache:** Static assets cached by Nginx
- **Application Cache:** Could be added for frequently accessed data
- **Database Cache:** PostgreSQL query cache

### Rate Limiting

- **API Protection:** 100 requests per 15 minutes
- **Prevents Abuse:** Protects from DDoS
- **Fair Usage:** Ensures service stability

---

## Deployment

### Production Checklist

- [ ] Set strong `JWT_SECRET` (min 32 characters)
- [ ] Configure `FRONTEND_URL` for CORS
- [ ] Set `NODE_ENV=production`
- [ ] Use managed PostgreSQL (avoid self-hosted)
- [ ] Enable HTTPS (SSL/TLS certificates)
- [ ] Configure backups for database
- [ ] Set up monitoring/alerting
- [ ] Configure log aggregation
- [ ] Set up CI/CD pipeline
- [ ] Test migrations on staging first

### Docker Deployment

```bash
# Build production image
docker build -t invoice-api:1.0.0 .

# Push to registry
docker tag invoice-api:1.0.0 registry.example.com/invoice-api:1.0.0
docker push registry.example.com/invoice-api:1.0.0

# Deploy to Kubernetes/Docker Swarm
# ... (platform-specific instructions)
```

---

## Support & Documentation

- **API Docs:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health
- **Issue Tracking:** GitHub Issues
- **Logs:** Check application logs with `docker-compose logs`

---
