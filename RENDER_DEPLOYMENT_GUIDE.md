# Render Deployment & Database Migration Guide

## 🚨 Current Issue: Missing Database Schema

**Error**: `relation "User" does not exist`

**Root Cause**: Prisma migrations have NOT been run on the Render PostgreSQL database, so the tables don't exist.

---

## ✅ Solution: Run Migrations on Render

### Step 1: Connect to Render Console

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Find your backend service
3. Click the service name
4. Go to the **"Shell"** tab
5. You'll see a terminal connected to your deployed app

### Step 2: Run Migrations

In the Render shell, run:

```bash
cd /app  # or your working directory
npx prisma migrate deploy
```

This will:
- Connect to your PostgreSQL database (via DATABASE_URL env var)
- Run all pending migrations
- Create all required tables

### Step 3: Verify Migrations Worked

```bash
npx prisma studio --browser=false
```

Or in your local terminal:
```powershell
# Set the remote DATABASE_URL
$env:DATABASE_URL = "postgresql://username:password@host:5432/dbname"

# Run Prisma Studio to view remote data
npx prisma studio
```

---

## 🔄 Alternative: Redeploy with Migration Command

If Render allows, add a build/pre-deploy hook:

**In Render Service Settings:**
1. Go to "Settings" → "Build & Deploy"
2. Add to **Build Command**:
   ```bash
   npm ci && npm run build && npx prisma migrate deploy
   ```

Or keep current build and add **Deploy Hook** or modify the start command to include migrations.

---

## 📋 Verification Steps

### Test 1: Check Database Connection
```bash
curl https://your-render-service.onrender.com/api/db-test
```

Expected response:
```json
{
  "status": "connected",
  "message": "Database connection successful",
  "userCount": 0
}
```

### Test 2: Try Registration
```bash
curl -X POST https://your-render-service.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }'
```

Expected response:
```json
{
  "message": "User registered successfully",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "email": "test@example.com",
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

---

## 🔧 Troubleshooting

### Error: "Migrations table not found"
- Your Render database is empty
- Solution: Run `npx prisma migrate deploy` or `npx prisma migrate dev --name init`

### Error: "ECONNREFUSED" on DATABASE_URL
- The DATABASE_URL env var isn't set correctly on Render
- Solution: Go to Render Dashboard → Environment tab → verify DATABASE_URL

### Error: "Migration conflicts detected"
- Local and remote migrations are out of sync
- Solution: Contact support or manually sync migrations

---

## 📚 Complete Deployment Checklist

- [ ] Environment variables configured on Render:
  - `DATABASE_URL` - PostgreSQL connection string
  - `JWT_SECRET` - For token signing
  - `NODE_ENV` - Set to "production"
  - Other required vars from `.env`

- [ ] Migrations run successfully on Render database

- [ ] Test `/api/db-test` endpoint returns "connected"

- [ ] Test `/api/auth/register` successfully creates users

- [ ] Frontend can successfully login/register

- [ ] No errors in Render logs

---

## 🚀 Quick Fix Checklist

1. ✅ Added better error logging to auth routes
2. ✅ Added `/api/db-test` endpoint to verify DB connection
3. ✅ This guide explains why migration failed
4. **Next**: SSH into Render and run `npx prisma migrate deploy`

