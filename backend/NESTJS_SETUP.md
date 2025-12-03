# NestJS Backend Setup

This document describes the NestJS backend structure running alongside the Express backend.

## Architecture

- **Express Backend**: Port 4000 (`/api/*`)
- **NestJS Backend**: Port 4001 (`/api/v2/*`)

Both backends share the same Prisma database.

## Project Structure

```
backend/
├── src/
│   ├── nest/              # NestJS application
│   │   ├── main.ts        # NestJS entry point
│   │   ├── app.module.ts  # Root module
│   │   ├── prisma/        # Prisma module
│   │   ├── auth/          # Authentication module
│   │   ├── user/          # User management module
│   │   ├── blog/          # Blog/CMS module
│   │   ├── ai/            # AI services module
│   │   └── calendar/      # Calendar module
│   └── index.ts           # Express entry point
├── prisma/
│   └── schema.prisma      # Shared database schema
└── package.json
```

## Modules

### 1. PrismaModule

- Provides Prisma Client across all modules
- Handles database connection lifecycle
- Shared with Express backend

### 2. AuthModule

- JWT-based authentication
- User registration and login
- Password hashing with bcrypt
- Passport JWT strategy
- Guards for protected routes

**Endpoints:**

- `POST /api/v2/auth/register` - Register new user
- `POST /api/v2/auth/login` - Login user
- `GET /api/v2/auth/me` - Get current user (protected)
- `POST /api/v2/auth/logout` - Logout (protected)

### 3. UserModule

- User profile management
- User listing with pagination
- Admin approval/suspension

**Endpoints:**

- `GET /api/v2/users/me` - Get own profile (protected)
- `PUT /api/v2/users/me` - Update own profile (protected)
- `GET /api/v2/users` - List users (admin)
- `GET /api/v2/users/:id` - Get user by ID (admin)
- `PUT /api/v2/users/:id/approve` - Approve user (admin)
- `PUT /api/v2/users/:id/suspend` - Suspend user (admin)

### 4. BlogModule

- Blog post management
- Public post listing
- Admin CMS features

**Endpoints:**

- `GET /api/v2/blog/posts` - List published posts
- `GET /api/v2/blog/posts/:slug` - Get post by slug
- `POST /api/v2/blog/posts` - Create post (protected)
- `GET /api/v2/blog/admin/posts` - List all posts (admin)
- `GET /api/v2/blog/admin/posts/:id` - Get post by ID (admin)
- `PUT /api/v2/blog/admin/posts/:id` - Update post (admin)
- `DELETE /api/v2/blog/admin/posts/:id` - Delete post (admin)
- `PUT /api/v2/blog/admin/posts/:id/publish` - Publish post (admin)
- `PUT /api/v2/blog/admin/posts/:id/unpublish` - Unpublish post (admin)

### 5. AiModule

- AI text generation
- Text summarization
- Content analysis

**Endpoints:**

- `POST /api/v2/ai/generate` - Generate text (protected)
- `POST /api/v2/ai/summarize` - Summarize text (protected)
- `POST /api/v2/ai/analyze` - Analyze content (protected)
- `GET /api/v2/ai/jobs/:jobId` - Get job status (protected)

### 6. CalendarModule

- Calendar management
- Event scheduling
- Event queries (today, upcoming)

**Endpoints:**

- `POST /api/v2/calendar/calendars` - Create calendar (protected)
- `GET /api/v2/calendar/calendars` - List calendars (protected)
- `DELETE /api/v2/calendar/calendars/:id` - Delete calendar (protected)
- `POST /api/v2/calendar/events` - Create event (protected)
- `GET /api/v2/calendar/events` - List events (protected)
- `GET /api/v2/calendar/events/today` - Today's events (protected)
- `GET /api/v2/calendar/events/upcoming` - Upcoming events (protected)
- `GET /api/v2/calendar/events/:id` - Get event (protected)
- `PUT /api/v2/calendar/events/:id` - Update event (protected)
- `DELETE /api/v2/calendar/events/:id` - Delete event (protected)

## Running the Application

### Development Mode

Start NestJS server:

```bash
npm run dev:nest
```

The server will run on `http://localhost:4001` with auto-reload enabled.

### Production Mode

Build and start:

```bash
npm run build:nest
npm run start:nest
```

## Configuration

Configuration is managed via environment variables:

```env
# Server
PORT=4001
NODE_ENV=development

# Database
DATABASE_URL="file:./dev.db"

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d

# AI Services (if using AI module)
OPENAI_API_KEY=your-openai-key
```

## Database Schema Alignment

The NestJS services use the actual Prisma schema fields:

### User Model Fields:

- `firstName` / `lastName` (not `name`)
- `active` boolean (not `status` string)
- `lastLogin` (not `lastLoginAt`)
- `passwordHash` (not `password`)
- `username` (required, unique)

### Authentication Flow:

1. User registers with email, username, password
2. Password is hashed with bcrypt (12 rounds)
3. User account starts as inactive (`active: false`)
4. Admin must approve user (`PUT /api/v2/users/:id/approve`)
5. User can then login and receive JWT token
6. Token is used for protected routes via `Authorization: Bearer <token>`

## Testing

Test the health endpoint:

```bash
curl http://localhost:4001/api/v2/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2025-12-03T11:49:30.000Z",
  "database": "connected"
}
```

## Development Notes

1. **TypeScript**: Uses `ts-node-dev` with `--transpile-only` for fast compilation
2. **Hot Reload**: File changes trigger automatic restart
3. **Validation**: DTOs use `class-validator` decorators
4. **Guards**: JWT guard protects authenticated routes, Role guards for admin routes
5. **Error Handling**: Built-in NestJS exception filters

## Next Steps

1. Add rate limiting
2. Add API documentation (Swagger)
3. Add request logging middleware
4. Add comprehensive unit tests
5. Add integration tests
6. Add API versioning strategy
7. Add caching layer (Redis)
8. Add WebSocket support
9. Add file upload handling
10. Add email service integration

## Troubleshooting

### Port Already in Use

```bash
# Windows
Get-NetTCPConnection -LocalPort 4001 | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }

# Linux/Mac
lsof -ti:4001 | xargs kill -9
```

### Database Connection Issues

- Ensure Prisma Client is generated: `npx prisma generate`
- Check DATABASE_URL in `.env`
- Verify database file exists: `prisma/dev.db`

### Module Import Errors

- Ensure all dependencies are installed: `npm install`
- Check circular dependencies
- Verify module imports in `app.module.ts`
