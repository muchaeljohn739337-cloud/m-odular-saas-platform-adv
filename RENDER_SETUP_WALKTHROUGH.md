# 🚀 Render Setup - Step-by-Step Guide

## ✅ YOUR SETUP CHECKLIST

### STEP 1: Create Render Account (5 minutes)
- [ ] Go to https://render.com
- [ ] Click "Sign Up"
- [ ] Enter email and password
- [ ] Verify email
- [ ] Account created ✅

**What You'll Get:**
- Free account
- No credit card needed
- Ability to create free-tier services
- Dashboard access

---

## STEP 2: Connect GitHub Repository (2 minutes)

### 2A. Go to Render Dashboard
1. Log in to: https://dashboard.render.com
2. You'll see: Dashboard → Services area (empty)

### 2B. Create First Service
1. Click: **"+ New"** button (top right)
2. Select: **"Web Service"**
3. You'll see: "Public Git Repository" option

### 2C. Connect GitHub
1. Click: **"Connect account"**
2. Select: **GitHub**
3. Authorize Render to access your GitHub
4. Select: **"-modular-saas-platform"** repository
5. Click: **"Connect"**

**Result:** Render now has access to your GitHub repo ✅

---

## STEP 3: Create Backend Service (5 minutes)

### 3A. Configure Backend Service
Fill in these fields:

**Name:** 
```
advancia-backend
```

**Environment:** 
```
Node
```

**Build Command:**
```bash
cd backend && npm ci && npm run build
```

**Start Command:**
```bash
cd backend && npm start
```

**Plan:** 
```
Free
```

**Region:** 
```
(Choose closest to you)
```

### 3B. Set Environment Variables (DON'T DEPLOY YET!)

Click: **"Advanced"** → **"Add Environment Variable"**

Add these variables one by one:

```
KEY: NODE_ENV
VALUE: production
```

```
KEY: PORT
VALUE: 4000
```

```
KEY: FRONTEND_URL
VALUE: https://advancia-frontend.onrender.com
```

### 3C. Skip Database URL for Now
- Don't add DATABASE_URL yet
- We'll create database in next step

### 3D. Create Service (But Don't Deploy)
- Click: **"Create Web Service"**
- Render will create the service
- **DO NOT** start deployment yet
- You should see: Service created with status "Build in progress" or similar

**Stop here! Don't let it deploy yet.** ⚠️

---

## STEP 4: Create PostgreSQL Database (5 minutes)

### 4A. Go Back to Dashboard
1. Click: Render logo (top left)
2. You're back at: Dashboard

### 4B. Create Database
1. Click: **"+ New"**
2. Select: **"PostgreSQL"**

### 4C. Configure Database
Fill in:

**Name:** 
```
advancia-db
```

**Database:** 
```
advancia_prod
```

**User:** 
```
advancia_user
```

**Region:** 
```
(Same as backend!)
```

**Plan:** 
```
Free
```

### 4D. Create Database
- Click: **"Create Database"**
- Wait: ~30 seconds for database to initialize
- You should see: "Your database is ready"

### 4E. Copy Connection String
1. Look for: **"Internal Database URL"** section
2. You should see a long URL like: `postgresql://advancia_user:password@dpg-xxxxx.render-internal:5432/advancia_prod`
3. **COPY THIS** - you'll need it in a moment
4. Save it temporarily (use notepad)

**Example format:**
```
postgresql://advancia_user:xxxxx@dpg-abc123.render-internal:5432/advancia_prod
```

---

## STEP 5: Add Database URL to Backend Service (2 minutes)

### 5A. Go Back to Services
1. Click: Dashboard → Services
2. Select: **advancia-backend**

### 5B. Add Database URL
1. Click: **"Settings"** (at the bottom)
2. Scroll to: **"Environment"**
3. Click: **"Add Environment Variable"**

```
KEY: DATABASE_URL
VALUE: (paste the connection string you copied)
```

4. Click: **"Save Changes"**

---

## STEP 6: Create Frontend Service (5 minutes)

### 6A. Back to Dashboard
1. Click: Dashboard (logo)
2. Click: **"+ New"**
3. Select: **"Web Service"**

### 6B. Connect GitHub Again
1. Select your repo: **"-modular-saas-platform"**
2. Click: **"Connect"**

### 6C. Configure Frontend
Fill in:

**Name:**
```
advancia-frontend
```

**Environment:**
```
Node
```

**Build Command:**
```bash
cd frontend && npm ci && npm run build
```

**Start Command:**
```bash
cd frontend && npm start
```

**Plan:**
```
Free
```

### 6D. Add Environment Variable
1. Click: **"Advanced"**
2. Add variable:

```
KEY: NEXT_PUBLIC_API_URL
VALUE: https://advancia-backend.onrender.com/api
```

### 6E. Create Service
- Click: **"Create Web Service"**
- It will start building/deploying

---

## STEP 7: Get Deploy Hooks (5 minutes)

Deploy hooks let GitHub automatically trigger Render deployments.

### 7A. Get Backend Deploy Hook

1. Go to: Dashboard → Services
2. Click: **advancia-backend**
3. Scroll down to: **"Deploy Hook"** section
4. You should see a long URL starting with: `https://api.render.com/deploy/srv-`
5. **COPY THIS URL** completely (it's long!)
6. Save it in notepad - label it: **BACKEND_HOOK**

### 7B. Get Frontend Deploy Hook

1. Click: Dashboard → Services
2. Click: **advancia-frontend**
3. Scroll down to: **"Deploy Hook"** section
4. **COPY THIS URL** completely
5. Save it in notepad - label it: **FRONTEND_HOOK**

---

## STEP 8: Add GitHub Secrets (5 minutes)

GitHub secrets let the GitHub Actions workflow trigger Render deployments.

### 8A. Go to GitHub Repo
1. Visit: https://github.com/pdtribe181-prog/-modular-saas-platform
2. Click: **Settings** (top menu)
3. Left sidebar: Click **"Secrets and variables"**
4. Click: **"Actions"**

### 8B. Add Backend Hook Secret

1. Click: **"New repository secret"**
2. Fill in:

**Name:**
```
RENDER_DEPLOY_HOOK_BACKEND
```

**Secret:** (paste the backend hook URL)
```
https://api.render.com/deploy/srv-xxxxxx...
```

3. Click: **"Add secret"**

### 8C. Add Frontend Hook Secret

1. Click: **"New repository secret"** again
2. Fill in:

**Name:**
```
RENDER_DEPLOY_HOOK_FRONTEND
```

**Secret:** (paste the frontend hook URL)
```
https://api.render.com/deploy/srv-xxxxxx...
```

3. Click: **"Add secret"**

**Result:** You should see both secrets listed now ✅

---

## STEP 9: Verify All Services Created (1 minute)

Go to: https://dashboard.render.com/services

You should see:
- [ ] **advancia-backend** (Web Service)
- [ ] **advancia-frontend** (Web Service)
- [ ] **advancia-db** (PostgreSQL)

All in the list with their statuses.

---

## ✅ SETUP COMPLETE!

You've successfully:
1. ✅ Created Render account
2. ✅ Connected GitHub
3. ✅ Created backend service
4. ✅ Created PostgreSQL database
5. ✅ Created frontend service
6. ✅ Got deploy hooks
7. ✅ Added GitHub secrets
8. ✅ Configured environment variables

**Total Time: ~30 minutes** ⏱️

---

## 🚀 NEXT: Trigger First Deployment

Now you can:

### Option A: Automatic Deployment (Recommended)
```bash
# In your local terminal, go to project folder:
cd C:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

# Make sure you're on main branch
git checkout main
git pull origin main

# Then push the deployment config
git push origin copilot/vscode1760640319320:main
```

GitHub Actions will automatically:
1. Run tests
2. Build the code
3. Trigger Render webhooks
4. Render deploys both services

### Option B: Manual Deployment in Render
1. Go to Render Dashboard
2. Click each service
3. Click: **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📊 WHAT'S HAPPENING DURING DEPLOYMENT

**Step 1: GitHub Actions** (5 minutes)
```
npm install dependencies
npm run build (TypeScript compilation)
npm run lint (check code)
Success? → Trigger Render webhooks
```

**Step 2: Render Backend** (2-3 minutes)
```
npm install
npm run build
npm start (runs server on 4000)
Database migrations run
```

**Step 3: Render Frontend** (2-3 minutes)
```
npm install
npm run build
npm start (runs on 3000)
```

**Total time: 10-15 minutes for first deployment**

---

## ✨ YOUR DEPLOYMENT IS READY!

Once deployed, you'll have:
- Backend API: `https://advancia-backend.onrender.com`
- Frontend App: `https://advancia-frontend.onrender.com`
- Database: PostgreSQL on Render

**Test it:**
```bash
# Test backend health
curl https://advancia-backend.onrender.com/health

# Visit frontend
https://advancia-frontend.onrender.com
```

---

## 📝 SAVING YOUR IMPORTANT INFO

Create a file with this info for future reference:

```
RENDER DEPLOYMENT INFO
======================

Backend Service:
- Name: advancia-backend
- URL: https://advancia-backend.onrender.com
- Deploy Hook: https://api.render.com/deploy/srv-xxxxx...

Frontend Service:
- Name: advancia-frontend
- URL: https://advancia-frontend.onrender.com
- Deploy Hook: https://api.render.com/deploy/srv-xxxxx...

Database:
- Name: advancia-db
- Database: advancia_prod
- User: advancia_user
- Connection: postgresql://advancia_user:xxxxx@dpg-xxxxx.render-internal:5432/advancia_prod

GitHub Secrets:
- RENDER_DEPLOY_HOOK_BACKEND: ✅ Added
- RENDER_DEPLOY_HOOK_FRONTEND: ✅ Added
```

---

## 🆘 TROUBLESHOOTING

### "Deploy Hook not working"
- [ ] Verify the URL is copied completely (no missing characters)
- [ ] Check GitHub secret name is EXACTLY: `RENDER_DEPLOY_HOOK_BACKEND`
- [ ] Secret should start with: `https://api.render.com/deploy/`

### "Build fails"
- [ ] Check Render logs: Services → Select service → Logs
- [ ] Look for error messages
- [ ] Common: Missing environment variable

### "Can't connect to frontend from backend"
- [ ] Check NEXT_PUBLIC_API_URL is set correctly in frontend env vars
- [ ] Should be: `https://advancia-backend.onrender.com/api`

### "Database connection failed"
- [ ] Verify DATABASE_URL is set in backend environment
- [ ] Should start with: `postgresql://`
- [ ] Check it matches the Internal Database URL from Render

---

**READY TO START? Let's do this! 🚀**

Questions about any step? Let me know!
