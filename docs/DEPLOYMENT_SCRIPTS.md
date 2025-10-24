# Deployment and Backup Scripts - Implementation Summary

This document describes the deployment and backup scripts added to the repository.

## Files Added

### 1. `scripts/deploy.sh`
Automated deployment script that:
- Detects and uses `docker compose` or `docker-compose`
- Starts PostgreSQL and Redis services
- Waits for database readiness with health checks
- Runs Prisma migrations (dev or deploy based on MODE)
- Generates Prisma client
- Supports both containerized and local Prisma execution
- Sources environment variables from `.env` if present

**Usage:**
```bash
# Production deployment
./scripts/deploy.sh

# Development deployment
MODE=dev ./scripts/deploy.sh

# Or using npm
npm run deploy
```

### 2. `scripts/backup_db.sh`
Database backup script that:
- Creates timestamped PostgreSQL backups
- Stores backups in `./db_backups/`
- Automatically cleans up old backups (keeps last 10)
- Validates database container is running

**Usage:**
```bash
# Create backup
./scripts/backup_db.sh

# Or using npm
npm run backup
```

### 3. `frontend/src/app/api/health/route.ts`
Next.js 13+ App Router API endpoint for health checks.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "ok",
  "uptime": 12345,
  "timestamp": "2025-10-19T17:00:00.000Z",
  "memory": {
    "rss": "150 MB",
    "heapTotal": "75 MB",
    "heapUsed": "50 MB",
    "external": "2 MB"
  }
}
```

### 4. `frontend/src/utils/sentry.ts`
Sentry error tracking initialization utility.

**Usage:**
```typescript
import { initSentry } from '@/utils/sentry';

// In your app entry point (e.g., _app.tsx or layout.tsx)
initSentry();
```

**Configuration:**
Set `SENTRY_DSN` or `NEXT_PUBLIC_SENTRY_DSN` in your `.env` file.

### 5. `docs/DB_BACKUP.md`
Comprehensive documentation for database backup and restore procedures.

### 6. `.env.example`
Root-level environment variable template with all required configuration.

**Setup:**
```bash
cp .env.example .env
# Edit .env with your values
```

### 7. Root `package.json`
Monorepo package.json with scripts for:
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate:dev` - Run dev migrations
- `npm run prisma:migrate:deploy` - Run production migrations
- `npm run prisma:db:push` - Push schema to database
- `npm run deploy` - Run deployment script
- `npm run backup` - Run backup script

## Environment Variables

Key environment variables added to `.env.example`:

### Database
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_USER` - Database username
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DB` - Database name

### Services
- `REDIS_URL` - Redis connection string
- `NODE_ENV` - Application environment
- `NEXT_PUBLIC_APP_URL` - Public application URL

### Security
- `JWT_SECRET` - JWT signing secret
- `SESSION_SECRET` - Session secret
- `SENTRY_DSN` - Sentry error tracking DSN

### Optional Services
- Email (Nodemailer)
- SMS (Twilio)
- Payment (Stripe)
- Blockchain (Ethereum)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   cd frontend && npm install
   cd ../backend && npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Deploy with Docker Compose:**
   ```bash
   npm run deploy
   ```

4. **Check application health:**
   ```bash
   curl http://localhost:3000/api/health
   ```

5. **Backup database:**
   ```bash
   npm run backup
   ```

## Technical Details

### Script Safety
- All scripts use `set -e` for fail-fast behavior
- Docker commands use `--rm` flag for automatic cleanup
- Proper error handling and logging
- POSIX-compatible shell syntax for portability

### CI/CD Compatibility
Scripts are designed to work in CI/CD environments:
- No interactive prompts
- Clear exit codes
- Verbose logging
- Timeout handling
- Health checks

### Flexibility
- Auto-detects docker compose command
- Falls back to local Prisma execution if needed
- Supports both development and production modes
- Configurable via environment variables

## Dependencies Added

### Frontend
- `@sentry/nextjs`: ^8.0.0 - Error tracking and monitoring

Note: Sentry is optional and will only initialize if `SENTRY_DSN` is configured.

## Maintenance

### Backup Retention
By default, `backup_db.sh` keeps the last 10 backups. To adjust:
```bash
# Edit scripts/backup_db.sh
# Modify the cleanup logic around line 70
```

### Scheduled Backups
See `docs/DB_BACKUP.md` for instructions on setting up automated daily backups using cron (Linux/macOS) or Task Scheduler (Windows).

## Troubleshooting

### Docker not found
**Error:** `Docker Compose not found`
**Solution:** Install Docker Desktop or Docker Engine with Docker Compose plugin

### Database connection failed
**Error:** `PostgreSQL did not become ready in time`
**Solution:** Check Docker service is running and ports are not in use

### Permission denied on scripts
**Error:** `Permission denied`
**Solution:** Ensure scripts are executable: `chmod +x scripts/*.sh`

## Related Documentation
- [Database Backup Guide](./docs/DB_BACKUP.md)
- [Environment Variables](../.env.example)
