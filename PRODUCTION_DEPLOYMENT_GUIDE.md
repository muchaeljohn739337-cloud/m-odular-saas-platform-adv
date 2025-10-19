# Production Deployment Guide: Steps 3-5# 🚀 PRODUCTION DEPLOYMENT GUIDE



## Overview**Status**: Project cleaned and ready for deployment  

This guide covers setting up production secrets, deploying backend and frontend, and going live with your Advancia Pay Ledger application.**Date**: October 18, 2025



## Step 3: Set Production Secrets ⚙️---



### 3.1 Database Setup## ✅ CLEANUP COMPLETED



#### PostgreSQL on Render.com (Recommended for Easy Setup)### Files Removed:

```bash- ✅ Test files (test-*.json, test-*.ps1)

# 1. Go to https://dashboard.render.com- ✅ Debug scripts (debug-*.ps1)

# 2. Create → PostgreSQL- ✅ Quick/temp scripts (quick-*.ps1, fix-*.ps1)

# 3. Name: advancia-postgres- ✅ Old encrypted secrets

# 4. Region: us-east (or closest to users)- ✅ SQLite database (dev only)

# 5. PostgreSQL Version: 15- ✅ node_modules (clean install)

# 6. Copy connection string- ✅ Build caches (.next, dist, .prisma)



# Connection string format:### Files Updated:

postgresql://user:password@host.render.com:5432/dbname- ✅ `.gitignore` - Added patterns for test/debug files

```- ✅ `backend/.env.example` - Production-ready template



#### PostgreSQL on AWS RDS---

```bash

# 1. Go to https://console.aws.amazon.com/rds## 📦 PACKAGE.JSON SCRIPTS

# 2. Create database → PostgreSQL 15

# 3. DB instance identifier: advancia-db### Backend (`backend/package.json`):

# 4. Master username: postgres```json

# 5. Generate password (save securely!){

# 6. Publicly accessible: Yes  "scripts": {

# 7. Wait for instance to be "available"    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",

# 8. Get endpoint: advancia-db.xxxxx.rds.amazonaws.com    "build": "tsc && prisma generate && prisma migrate deploy || echo 'Migrations skipped'",

    "start": "node dist/index.js",

# Connection string:    "prisma:generate": "prisma generate"

postgresql://postgres:PASSWORD@advancia-db.xxxxx.rds.amazonaws.com:5432/advancia_ledger  }

```}

```

#### PostgreSQL on Railway.app

```bash### What Each Script Does:

# 1. Go to https://railway.app- **`npm run dev`** - Local development with hot reload

# 2. New Project → Provision PostgreSQL- **`npm run build`** - Compile TypeScript + Generate Prisma client + Run migrations

# 3. Connect service automatically- **`npm start`** - Start production server from compiled code

# 4. Copy DATABASE_URL from Variables- **`npm run prisma:generate`** - Generate Prisma client only



# Connection string provided automatically---

```

## 🌐 RENDER DEPLOYMENT

### 3.2 Generate Secure Secrets

### Backend Service:

```bash

# Generate JWT Secret (32+ characters)**Build Command**:

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"```bash

# Output: e1f8a9c3d2b4e7f1a3c5e9b2d4f6a8c1cd backend && npm ci && npm run build

```

# Generate Session Secret (32+ characters)

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"**Start Command**:

# Output: f2g9b0d4e8f2a4c6e0b3d5f7a9c1e3g5```bash

cd backend && npm start

# Generate API Key (32+ characters)```

node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Output: g3h0c1e5f9g3b5d7f1c4e6g8b0d2f4h6**Environment Variables** (Set in Render Dashboard):

``````bash

NODE_ENV=production

### 3.3 Twilio ConfigurationDATABASE_URL=<Render PostgreSQL URL>

PORT=4000

```bashFRONTEND_URL=https://your-frontend.onrender.com

# 1. Sign up at https://www.twilio.comJWT_SECRET_ENCRYPTED=<your-encrypted-secret>

# 2. Go to Console DashboardETH_PROVIDER_URL=https://ethereum.publicnode.com

# 3. Copy Account SID and Auth Token```

# 4. Buy a Twilio phone number (+1234567890)

### Frontend Service:

# Get phone number verification code from SMS

# Verify in your application settings**Build Command**:

``````bash

cd frontend && npm ci && npm run build

### 3.4 Stripe Configuration```



```bash**Start Command**:

# 1. Sign up at https://dashboard.stripe.com```bash

# 2. Get API keys:cd frontend && npm start

#    - Publishable key (pk_live_...)```

#    - Secret key (sk_live_...)

# 3. Create webhook endpoint:**Environment Variables**:

#    - URL: https://api.advanciapayledger.com/webhooks/stripe```bash

#    - Events: charge.succeeded, charge.failed, etc.NEXT_PUBLIC_API_URL=https://your-backend.onrender.com

#    - Get signing secret (whsec_...)```

```

---

### 3.5 Production .env File

## 🔧 LOCAL DEVELOPMENT

Create `backend/.env.production`:

### Fresh Setup:

```bash```powershell

# ===== DATABASE =====# 1. Clean install (done)

DATABASE_URL="postgresql://user:password@host:5432/advancia_ledger"./reinstall-dependencies.ps1



# ===== URLS =====# 2. Configure environment

FRONTEND_URL="https://advanciapayledger.com"cp backend/.env.example backend/.env

BACKEND_URL="https://api.advanciapayledger.com"# Edit backend/.env with your local settings

NODE_ENV="production"

PORT=4000# 3. Run migrations

cd backend

# ===== SECURITY SECRETS =====npx prisma migrate dev

JWT_SECRET="e1f8a9c3d2b4e7f1a3c5e9b2d4f6a8c1"

SESSION_SECRET="f2g9b0d4e8f2a4c6e0b3d5f7a9c1e3g5"# 4. Start servers

API_KEY="g3h0c1e5f9g3b5d7f1c4e6g8b0d2f4h6"cd ..

./run-local.ps1

# ===== TWILIO (SMS OTP) =====```

TWILIO_ACCOUNT_SID="ACxxxxxxxxxxxxxxxxxxxxxxxx"

TWILIO_AUTH_TOKEN="your-auth-token-here"### Daily Development:

TWILIO_PHONE_NUMBER="+1234567890"```powershell

./run-local.ps1

# ===== STRIPE (PAYMENTS) =====```

STRIPE_SECRET_KEY="sk_live_..."

STRIPE_WEBHOOK_SECRET="whsec_..."---



# ===== LOGGING & MONITORING =====## 📝 .ENV CONFIGURATION

LOG_LEVEL="info"

SENTRY_DSN="https://key@sentry.io/projectid"### Development (.env):

```bash

# ===== OPTIONAL: RATE LIMITING =====DATABASE_URL="file:./dev.db"

RATE_LIMIT_WINDOW_MS=900000NODE_ENV=development

RATE_LIMIT_MAX_REQUESTS=100PORT=4000

```FRONTEND_URL="http://localhost:3000"

JWT_SECRET_ENCRYPTED="dev-secret"

### 3.6 Deploy Secrets to Production PlatformETH_PROVIDER_URL="https://ethereum.publicnode.com"

```

#### For Render.com:

```bash### Production (Render):

# 1. Go to Service Settings```bash

# 2. EnvironmentDATABASE_URL="<Render provides this>"

# 3. Add each variable from .envNODE_ENV=production

# 4. Click "Deploy" to apply changesPORT=4000

```FRONTEND_URL="https://your-app.onrender.com"

JWT_SECRET_ENCRYPTED="<from GitHub Secrets>"

#### For AWS:ETH_PROVIDER_URL="https://ethereum.publicnode.com"

```bash```

# Using AWS Secrets Manager:

aws secretsmanager create-secret \---

  --name advancia/db/url \

  --secret-string "postgresql://..."## 🔒 SECURITY CHECKLIST



# Using Systems Manager Parameter Store:### Before Deployment:

aws ssm put-parameter \- [ ] `.env` is NOT committed to Git

  --name /advancia/db/url \- [ ] `.gitignore` includes `.env`

  --value "postgresql://..." \- [ ] All secrets are in Render environment variables

  --type SecureString- [ ] JWT_SECRET is strong (32+ characters)

```- [ ] Database uses strong password

- [ ] CORS is configured for production domain

#### For Railway.app:- [ ] Rate limiting is enabled

```bash- [ ] Admin endpoints require authentication

# 1. Go to project Variables

# 2. Add each variable from .env---

# 3. Redeploy service

```## 🧪 TESTING



## Step 4: Deploy Backend 🚀### Local Build Test:

```powershell

### 4.1 Deploy to Render.com (Recommended for Beginners)cd backend

npm run build

#### Create Web Servicenpm start

```bash```

# 1. Go to https://dashboard.render.com

# 2. New → Web Service### Endpoint Tests:

# 3. Connect GitHub repository```powershell

# 4. Select: -modular-saas-platform# Health check

# 5. Configure:curl http://localhost:4000/api/health

#    - Name: advancia-backend

#    - Root Directory: backend# ETH gateway

#    - Runtime: Nodecurl http://localhost:4000/api/eth/gas-price

#    - Build Command: npm install && npx prisma generate && npm run build```

#    - Start Command: npm run start

#    - Environment: production---

# 6. Add Environment Variables from .env

# 7. Create Web Service## 📊 DEPLOYMENT FLOW

```

```

#### Configure Auto-DeployLocal Changes

```bash    ↓

# 1. Go to Service Settingsgit add -A

# 2. Deploy hooks    ↓

# 3. Check "Auto-deploy on push to main"git commit -m "message"

# 4. Backend will deploy automatically on each push!    ↓

```git push origin main

    ↓

#### Database MigrationGitHub Actions (tests)

```bash    ↓

# 1. In Render console, select your PostgreSQL databaseRender Auto-Deploy

# 2. Get connection string    ↓

# 3. From local machine, apply migrations:Backend: npm ci → npm run build → npm start

Frontend: npm ci → npm run build → npm start

DATABASE_URL="postgresql://..." npx prisma migrate deploy    ↓

```✅ LIVE!

```

### 4.2 Deploy to AWS

---

#### Option A: Using Elastic Beanstalk (Simple)

```bash## 🛠️ SCRIPTS AVAILABLE

# 1. Go to Elastic Beanstalk console

# 2. Create application → Advancia Backend### Maintenance:

# 3. Choose platform: Node.js```powershell

# 4. Upload code or connect GitHub./cleanup-project.ps1         # Remove temp files, clean caches

# 5. Configure load balancer with HTTPS./reinstall-dependencies.ps1  # Fresh install all dependencies

# 6. Deploy!```

```

### Development:

#### Option B: Using ECS (Docker)```powershell

```bash./setup-local.ps1            # Complete first-time setup

# 1. Create Dockerfile in backend/./run-local.ps1              # Start backend + frontend

# 2. Push to ECR./fix-prisma.ps1             # Fix Prisma issues

# 3. Create ECS cluster```

# 4. Create task definition

# 5. Create service### Database:

# 6. Configure load balancer```powershell

```cd backend

npx prisma studio            # Visual database editor

### 4.3 Deploy to Railway.appnpx prisma migrate dev       # Create new migration

npx prisma migrate reset     # Reset database

```bashnpx prisma generate          # Regenerate client

# 1. Go to https://railway.app```

# 2. New Project → Deploy from GitHub

# 3. Select repository---

# 4. Configure:

#    - Service: backend## 🚀 DEPLOYMENT STEPS

#    - Root directory: backend

#    - Build command: npm install && npx prisma generate### 1. Commit Cleaned Project:

#    - Start command: npm run start```powershell

# 5. Add environment variablesgit status

# 6. Deploy!git add -A

```git commit -m "chore: Clean project and prepare for production"

git push origin main

### 4.4 Verify Backend Deployment```



```bash### 2. Monitor Render:

# Test health endpoint- Watch build logs in Render dashboard

curl https://api.advanciapayledger.com/health- Verify environment variables are set

- Check health endpoint after deployment

# Expected response:

{### 3. Verify Deployment:

  "status": "healthy",```bash

  "database": "connected",# Health check

  "timestamp": "2025-10-19T12:00:00Z"curl https://your-api.onrender.com/api/health

}

# Expected response:

# Test auth endpoint{

curl -X POST https://api.advanciapayledger.com/api/auth/register \  "status": "ok",

  -H "Content-Type: application/json" \  "timestamp": "2025-10-18T...",

  -d '{"email":"test@example.com","password":"Test123456"}'  "uptime": 123.45

```}

```

## Step 5: Deploy Frontend 🎨

---

### 5.1 Deploy to Vercel (Recommended for Next.js)

## ⚡ QUICK COMMANDS

#### Connect Repository

```bash```powershell

# 1. Go to https://vercel.com# Cleanup and reinstall

# 2. Import Project./cleanup-project.ps1 && ./reinstall-dependencies.ps1

# 3. Select your repository

# 4. Configure:# Build and test locally

#    - Framework: Next.jscd backend && npm run build && npm start

#    - Root directory: frontend

#    - Build command: npm run build# Deploy to production

#    - Output directory: .nextgit add -A && git commit -m "Deploy" && git push origin main

#    - Environment Variables:

#      NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com# Check Render logs

# 5. Click Deploy# Visit: https://dashboard.render.com

``````



#### Add Custom Domain---

```bash

# 1. Go to project Settings## 🎯 PRODUCTION CHECKLIST

# 2. Domains

# 3. Add Domain: advanciapayledger.com### Pre-Deploy:

# 4. Update DNS records with Vercel nameservers- [x] Project cleaned (temp files removed)

# 5. Vercel handles SSL automatically!- [x] Dependencies freshly installed

```- [x] .gitignore updated

- [x] .env.example updated

#### Auto-Deploy- [ ] Build tested locally

```bash- [ ] All tests passing

# Vercel automatically deploys on every push to main- [ ] Environment variables configured in Render

# No additional configuration needed!

```### Post-Deploy:

- [ ] Health endpoint responding

### 5.2 Deploy to Netlify- [ ] Database connected

- [ ] Migrations applied

```bash- [ ] Frontend loads correctly

# 1. Go to https://app.netlify.com- [ ] API endpoints working

# 2. New Site → Import an Existing Project- [ ] WebSocket connections stable

# 3. GitHub → Select repository

# 4. Configure:---

#    - Base directory: frontend

#    - Build command: npm run build## 📚 DOCUMENTATION

#    - Publish directory: .next

#    - Environment: NEXT_PUBLIC_API_URL- `DEPLOYMENT_READY.md` - Complete deployment guide

# 5. Deploy!- `RENDER_QUICK_START.md` - 5-step Render deployment

```- `RENDER_ERROR_ANALYSIS.md` - Troubleshooting build errors

- `backend/.env.example` - Environment variable template

### 5.3 Deploy to AWS CloudFront + S3

---

```bash

# 1. Build frontend: npm run build**✅ Your project is now clean and production-ready!**

# 2. Upload to S3 bucket

# 3. Create CloudFront distributionNext: Wait for reinstall to complete, then commit and push to deploy! 🚀

# 4. Point custom domain to CloudFront
# 5. Enable SSL via ACM
```

### 5.4 Verify Frontend Deployment

```bash
# 1. Visit https://advanciapayledger.com
# 2. Check:
#    - Page loads without SSL warnings
#    - Logo and assets display correctly
#    - Login page appears
# 3. Try login with test account
# 4. Check browser console for API errors
```

## Step 6: Final Testing & Verification ✅

### 6.1 Health Checks

```bash
# Backend Health
curl https://api.advanciapayledger.com/health

# Frontend Access
curl -L https://advanciapayledger.com -I
# Expected: 200 OK

# SSL Certificate
openssl s_client -connect api.advanciapayledger.com:443 -brief
# Expected: "connect:errno 0"
```

### 6.2 User Registration Flow

```bash
# 1. Visit https://advanciapayledger.com
# 2. Click "Sign Up"
# 3. Enter email, password, name
# 4. Submit form
# 5. Should see verification email or SMS
# 6. Verify and confirm account creation
```

### 6.3 User Login Flow

```bash
# 1. Enter credentials
# 2. Click "Sign In"
# 3. Should redirect to dashboard
# 4. Check localStorage for JWT token
# 5. Verify user data displays correctly
```

### 6.4 OTP/2FA Testing

```bash
# 1. Enable 2FA in settings
# 2. Scan QR code with authenticator app
# 3. Enter 6-digit code to verify
# 4. Test backup codes generation
# 5. Test OTP on login
```

### 6.5 Backup Codes Testing

```bash
# 1. Generate backup codes
# 2. Save codes securely
# 3. Try using one to login
# 4. Verify it marks as used
# 5. Check remaining count
```

### 6.6 Monitoring & Logging

```bash
# Check logs on deployment platform
# Look for:
# ✅ No error messages
# ✅ Database connections successful
# ✅ API requests completing normally
# ✅ No unhandled exceptions
```

## Production Checklist

### Pre-Deployment
- [ ] All code merged to main branch
- [ ] PR #9 backup codes feature merged
- [ ] Environment variables configured
- [ ] Database created and migrated
- [ ] SSL certificates installed
- [ ] DNS records configured
- [ ] Security hardened (CORS, rate limiting, etc.)

### Backend Deployment
- [ ] Backend service deployed
- [ ] Health endpoint responding
- [ ] Database connection verified
- [ ] API endpoints accessible via custom domain
- [ ] SSL certificate working
- [ ] Logging configured
- [ ] Rate limiting enabled

### Frontend Deployment
- [ ] Frontend built and deployed
- [ ] Custom domain configured
- [ ] API URL points to production backend
- [ ] SSL certificate working
- [ ] Assets loading correctly
- [ ] Performance acceptable

### Testing
- [ ] User registration works
- [ ] User login works
- [ ] OTP/2FA works
- [ ] Backup codes work
- [ ] Token refresh works
- [ ] No SSL/CORS errors
- [ ] No database errors
- [ ] Load testing passed

### Monitoring
- [ ] Error tracking (Sentry) configured
- [ ] Logs being collected
- [ ] Alerts configured for errors
- [ ] Performance monitoring enabled
- [ ] Uptime monitoring enabled

### Security
- [ ] No hardcoded secrets in code
- [ ] Secrets only in environment
- [ ] HTTPS enforced everywhere
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Database encrypted
- [ ] Backups enabled

## Rollback Plan

If something goes wrong:

```bash
# Render.com Rollback
# 1. Go to Deployments
# 2. Select previous working deployment
# 3. Click "Redeploy"

# Vercel Rollback
# 1. Go to Deployments
# 2. Select previous working deployment
# 3. Click "Redeploy"

# Git Rollback (if needed)
git revert <commit-hash>
git push origin main
# Redeploy will use new commit
```

## Monitoring & Alerts

### Set Up Error Tracking (Sentry)
```bash
# 1. Sign up at https://sentry.io
# 2. Create project for Node.js backend
# 3. Create project for Next.js frontend
# 4. Get DSN URLs
# 5. Add to .env files
# 6. Configure alerts for critical errors
```

### Set Up Performance Monitoring
```bash
# 1. Use Render.com metrics
# 2. Or AWS CloudWatch
# 3. Or New Relic
# 4. Monitor:
#    - Response times
#    - Error rates
#    - Database query times
#    - CPU/Memory usage
```

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch for errors in logs
   - Check user feedback
   - Monitor performance

2. **Complete Feature Implementation**
   - Token/Coin Wallet (26% → 100%)
   - Advanced Rewards System
   - MedBed Health Integration

3. **Add Testing**
   - Unit tests
   - Integration tests
   - E2E tests

4. **Set Up CI/CD Pipeline**
   - Automated testing on push
   - Automated deployments
   - Slack notifications

## Emergency Contacts

```
- API Errors: Check /health endpoint
- Database Issues: Check connection string
- SSL Errors: Check certificate expiration
- Domain Issues: Check DNS propagation
- Deployment Issues: Check platform dashboard
```

---

**Status:** Ready for deployment  
**Estimated Time:** 2-4 hours  
**Risk Level:** Low (with testing)

✅ **Timeline:**
- Step 3: 30 min
- Step 4: 30 min
- Step 5: 30 min
- Testing: 1-2 hours
- **Total: 2.5-3.5 hours**

