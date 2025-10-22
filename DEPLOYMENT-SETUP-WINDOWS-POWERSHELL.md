# 🚀 DEPLOYMENT SETUP GUIDE - Windows PowerShell Edition

## Quick Summary

Your Render deployment got a **502 Bad Gateway** error, which likely means:

- Backend service crashed or didn't start
- Database migration failed (P3009 issue we fixed)
- Connection timeout to database

This guide will help you:

1. Pull the latest code with all fixes
2. Set up local environment properly
3. Test everything locally before redeploying to Render

---

## PART A: Pull Latest Code from GitHub

### Step 1: Fetch and Merge Latest Changes

```powershell
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

# Fetch all remote changes
git fetch origin

# Switch to main and pull latest
git checkout main
git pull origin main

# Verify you have latest commit (d5cc24e with migration fix)
git log --oneline -3
```

**Expected output:**

```
d5cc24e (HEAD -> main, origin/main) Fix: Make crypto balance migration idempotent...
137b93f ✅ Add Vercel deployment verification report...
641b0c2 📋 Add comprehensive iteration & optimization roadmap...
```

---

## PART B: Configure Environment Variables

### Step 2: Create .env File from Template

```powershell
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend

# Create .env from template
Copy-Item .env.example .env

# Open in your editor and fill in the values
# Use Notepad, VS Code, or your preferred editor
code .env
# OR
notepad .env
```

### Step 3: Edit .env with Your Values

**Required values to fill in:**

```env
# Database
DATABASE_URL="postgresql://postgres:YourStrongPassword@localhost:5432/saas_platform"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="YourStrongPassword"
POSTGRES_DB="saas_platform"

# JWT & Security
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
API_KEY="dev-api-key-12345"

# URLs (for local development)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
BACKEND_URL="http://localhost:4000"

# Optional (can leave as-is for local testing)
NODE_ENV="development"
SENTRY_DSN=""
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_VERIFY_SERVICE_SID=""
```

**⚠️ Important:** Use STRONG password for POSTGRES_PASSWORD!

---

## PART C: Start Docker Services

### Step 4: Start PostgreSQL and Redis

```powershell
# Navigate to project root
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

# Start database and Redis in background
docker compose up -d db redis

# Wait a moment for services to start
Start-Sleep -Seconds 3

# Check if services are running
docker compose ps
```

**Expected output:**

```
NAME    COMMAND                  SERVICE      STATUS
db      postgres               db             Up 2 seconds
redis   redis-server           redis          Up 1 second
```

### Step 5: Wait for PostgreSQL to be Ready

```powershell
# Wait for Postgres to accept connections
$retries = 0
while ($retries -lt 30) {
    try {
        docker compose exec db pg_isready -U postgres
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "⏳ Waiting for PostgreSQL... ($retries/30)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $retries++
    }
}
```

---

## PART D: Deploy Backend (Apply Migrations + Start App)

### Step 6: Navigate to Backend Directory

```powershell
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend
```

### Step 7: Install Dependencies

```powershell
# Install npm packages
npm install
```

### Step 8: Apply Database Migrations

```powershell
# This will run all pending migrations (including our P3009 fix!)
npx prisma migrate deploy

# Expected output:
# ✓ Environment variables loaded from .env
# ✓ Your database is now in sync with your schema. No migrations were run.
```

### Step 9: Generate Prisma Client

```powershell
# Generate Prisma client (required after schema changes)
npx prisma generate
```

### Step 10: Start the Backend Server

```powershell
# Option A: Development mode with auto-reload
npm run dev

# Option B: Production build + start
npm run build
npm start
```

**Expected output when starting:**

```
🚀 Server running on http://localhost:4000
✅ Health check endpoint: GET /api/health
🔌 Socket.IO ready for real-time updates
📊 Database connected
```

---

## PART E: Verify Backend Health

### Step 11: Test Health Endpoint (New PowerShell Tab)

```powershell
# In a NEW PowerShell terminal, test the health endpoint
$response = Invoke-RestMethod -Uri "http://localhost:4000/api/health" -Method Get
$response | ConvertTo-Json

# Expected response:
# {
#   "status": "healthy",
#   "timestamp": "2025-10-22T18:30:45.123Z",
#   "service": "advancia-backend",
#   "version": "1.0.0"
# }
```

### Step 12: Check Backend Logs

```powershell
# View running backend process logs
# If you ran "npm run dev", you'll see logs in that terminal

# Or check Docker if using containers:
docker compose logs -f app
```

---

## PART F: Start Frontend (Optional Local Testing)

### Step 13: Start Frontend in New Terminal

```powershell
# Open new PowerShell tab and navigate to frontend
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev

# Expected output:
# ▲ Next.js 14.2.33
# - Local:        http://localhost:3000
# - Environments: .env.local
```

### Step 14: Test Registration Flow

```powershell
# Open browser and visit:
# http://localhost:3000/auth/register

# Try creating a test account:
# Email: test@example.com
# Password: TestPass123!
# First Name: Test
# Last Name: User

# Expected: Account created, redirected to dashboard
```

---

## PART G: Database Backup & Restore

### Step 15: Create Database Backup

```powershell
# Option A: Using Docker
docker compose exec db pg_dump -U postgres saas_platform > db_backup_$(Get-Date -Format "yyyy-MM-dd_HH-mm-ss").sql

# Option B: Using pg_dump directly (if installed)
pg_dump -h localhost -U postgres saas_platform > db_backup_$(Get-Date -Format "yyyy-MM-dd_HH-mm-ss").sql
```

### Step 16: Test Restore (Optional)

```powershell
# WARNING: This will overwrite your current database!
# Get latest backup file
$backup = Get-ChildItem db_backup_*.sql | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Restore from backup
docker compose exec -T db psql -U postgres < $backup.FullName

# Verify restore worked
docker compose exec db psql -U postgres -c "SELECT COUNT(*) FROM users;"
```

---

## PART H: Fix & Redeploy to Render

### Step 17: If Tests Pass Locally, Commit and Push

```powershell
# Stage all changes
git add .

# Commit
git commit -m "Deploy: Local validation passed, ready for production"

# Push to trigger Render redeploy
git push origin main
```

### Step 18: Monitor Render Deployment

```powershell
# Monitor Render dashboard
# https://dashboard.render.com

# Check your backend service:
# - Should show "Building" → "Deploying" → "Live"
# - Check logs for migration success
# - Verify /api/health endpoint responds
```

---

## Common Issues & Fixes

### Issue: "ECONNREFUSED" - Can't connect to PostgreSQL

**Fix:**

```powershell
# Check if container is running
docker compose ps

# If not running:
docker compose up -d db redis

# Check logs:
docker compose logs db
```

### Issue: "P1001" Prisma migration error

**Fix:**

```powershell
# Reset database (WARNING: loses all data)
npx prisma migrate reset

# Or manually create schema:
npx prisma db push
```

### Issue: Port 4000 already in use

**Fix:**

```powershell
# Find process using port 4000
Get-NetTCPConnection -LocalPort 4000

# Kill the process
Stop-Process -Id [PID] -Force

# Or use different port:
$env:PORT=5000
npm run dev
```

### Issue: "Module not found" or dependency errors

**Fix:**

```powershell
# Clear node_modules and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Issue: Docker compose command not found

**Fix:**

```powershell
# Install Docker Desktop (includes docker compose)
# https://www.docker.com/products/docker-desktop

# Or use full command:
docker compose up -d db redis
```

---

## Step-by-Step Verification Checklist

- [ ] **Step 1:** Git pull successful, have commit d5cc24e
- [ ] **Step 2-3:** .env file created and filled with secrets
- [ ] **Step 4-5:** Docker services running (postgres + redis)
- [ ] **Step 8:** Migrations applied successfully
- [ ] **Step 9:** Prisma client generated
- [ ] **Step 10:** Backend server started on port 4000
- [ ] **Step 11:** Health endpoint responds with 200 OK
- [ ] **Step 13-14:** Frontend starts and registration works
- [ ] **Step 15:** Database backup created
- [ ] **Step 17-18:** Code pushed and Render redeployment started

---

## After Successful Local Testing

### Configure Render Environment

1. **Add .env secrets to Render:**

   ```
   Dashboard → Backend Service → Environment
   Add all .env variables
   ```

2. **Redeploy from main branch:**

   ```
   Dashboard → Backend Service → Manual Deploy
   ```

3. **Verify production health:**

   ```powershell
   Invoke-RestMethod https://advancia-pay-ledger-backend.onrender.com/api/health
   ```

4. **Monitor for 502 errors:**
   - Check Render logs for migration/startup errors
   - Verify all environment variables are set
   - Check database connection string is correct

---

## Next Steps if All Tests Pass

1. ✅ Application is running locally
2. ✅ Database is responding
3. ✅ Migrations applied successfully
4. ✅ API endpoints working
5. ✅ User registration functional
6. 🎯 Ready for production deployment!

Push to main and Render will auto-deploy. Monitor the dashboard for successful deployment.

---

**Questions?** Check the detailed logs:

- Backend: `docker compose logs -f app`
- Database: `docker compose logs -f db`
- Frontend: Check browser console (F12)
- Git: `git log --oneline -10`
