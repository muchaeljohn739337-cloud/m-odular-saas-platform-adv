# 🚀 PHASE 4: DEPLOY FRONTEND IN RENDER (SELF-HOSTED)

**Status:** 🟢 **READY TO EXECUTE**  
**Time:** ~30-45 minutes  
**Backend URL:** `https://modular-saas-backend.onrender.com`  
**Goal:** Frontend running in Render as second service

---

## ✅ WHAT YOU'LL ACHIEVE

```
Before:
├── Backend: https://modular-saas-backend.onrender.com ✅
└── Frontend: (nowhere)

After:
├── Backend: https://modular-saas-backend.onrender.com ✅
└── Frontend: https://modular-saas-frontend.onrender.com ✅

🎉 BOTH SELF-HOSTED IN RENDER!
```

---

## 📋 STEP 1: Create Dockerfile for Frontend (2 minutes)

**Create file:** `frontend/Dockerfile`

Copy this exactly:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY next.config.js ./
EXPOSE 3000
CMD ["npm", "start"]
```

**This does:**
- Stage 1: Builds Next.js app (creates .next folder)
- Stage 2: Runs production version (smaller, faster)
- Exposes port 3000 for Render

---

## 📋 STEP 2: Create .dockerignore for Frontend (1 minute)

**Create file:** `frontend/.dockerignore`

Copy this exactly:

```
node_modules
npm-debug.log
.git
.gitignore
.env.local
.env
.next
.vercel
.DS_Store
*.md
```

**This tells Docker:** Don't copy these files into the container (saves space)

---

## 📋 STEP 3: Commit These Files to GitHub (2 minutes)

In your terminal:

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

# Add the new files
git add frontend/Dockerfile frontend/.dockerignore

# Commit
git commit -m "Add Docker configuration for frontend deployment to Render"

# Push to GitHub
git push origin main
```

**Verify in GitHub:**
- Go to https://github.com/pdtribe181-prog/-modular-saas-platform
- Click "frontend" folder
- Should see Dockerfile and .dockerignore ✅

---

## 📋 STEP 4: Deploy Frontend Service in Render (15-20 minutes)

### **Step 4A: Go to Render Dashboard**

1. Open: https://dashboard.render.com
2. Login with your account (same one that has backend)
3. You should see your backend service listed

### **Step 4B: Create New Web Service**

1. Click **"New +"** button (top area)
2. Select **"Web Service"**

### **Step 4C: Connect GitHub Repository**

1. Look for your repo: `-modular-saas-platform`
2. If not visible, click "Connect account" → authorize GitHub
3. Select the repo
4. Click **"Connect"**

### **Step 4D: Configure Service**

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `modular-saas-frontend` |
| **Environment** | `Docker` |
| **Root Directory** | `frontend` |
| **Auto-deploy** | Toggle ON (optional but recommended) |

Leave other fields default.

### **Step 4E: Add Environment Variables**

This is CRITICAL for frontend to connect to backend:

1. Scroll down to **"Environment"** section
2. Click **"Add Environment Variable"**
3. Add TWO variables:

**Variable 1:**
```
Key:   NEXT_PUBLIC_API_URL
Value: https://modular-saas-backend.onrender.com
```

**Variable 2:**
```
Key:   NODE_ENV
Value: production
```

**Important:** `NEXT_PUBLIC_` prefix makes this available in browser!

### **Step 4F: Select Plan**

1. At bottom, select plan:
   - **Free** - Good for testing (sleeps after 15 min inactivity)
   - **Starter** - $7/mo (recommended, always on)

2. For production, **I recommend Starter** (~$7/month)

### **Step 4G: Deploy!**

1. Click **"Create Web Service"** button (bottom right)
2. Render will start building
3. Watch the logs scroll by
4. Should see:
   ```
   ✓ Building Docker image...
   ✓ Deploying...
   ✓ Build successful!
   ```

5. When complete, you'll see:
   ```
   Your service is live at: https://modular-saas-frontend.onrender.com
   ```

**This takes 5-10 minutes. Don't close the browser!**

---

## ✅ STEP 5: Verify Deployment (5 minutes)

### **5A: Check Deployment Status**

1. Render dashboard shows service status
2. Look for: **Green dot** = Service is running ✅
3. Red dot = Something failed (check logs)

### **5B: Open Your Frontend**

1. Click the frontend service name: `modular-saas-frontend`
2. Click **"Visit Site"** button
3. Your frontend should load! ✅

### **5C: Check Browser Console**

1. Frontend opens in browser
2. Press **F12** to open DevTools
3. Go to **"Console"** tab
4. Should see NO red error messages ✅

### **5D: Check Network Calls**

1. Still in DevTools, go to **"Network"** tab
2. Reload page (F5)
3. Look for API calls
4. Should be calling: `https://modular-saas-backend.onrender.com/...`
5. Status should be **200** (green) ✅

---

## 🆘 TROUBLESHOOTING

### **Problem: Build Failed**

**Error in Render logs:**

1. Click the failed deployment
2. Scroll down to see error message
3. Common fixes:
   - Missing package: Run `npm install` locally, commit, and retry
   - TypeScript error: Run `npm run build` locally to debug
   - Port already in use: Delete and recreate service

### **Problem: Service Deployed but Shows Blank Page**

**Solution:**

1. Check environment variables are set:
   - Render dashboard → Frontend service → Environment
   - Verify `NEXT_PUBLIC_API_URL` exists

2. Rebuild service:
   - Click "..." menu → "Rebuild"
   - Wait for redeploy

### **Problem: CORS Error (Can't Call Backend)**

**Console shows CORS error:**

1. Update backend CORS_ORIGIN:
   - Render dashboard → Backend service
   - Environment variables
   - Update `CORS_ORIGIN` to include frontend:
     ```
     CORS_ORIGIN=https://modular-saas-frontend.onrender.com
     ```

2. Restart backend:
   - Click "..." menu → "Restart service"

3. Retry from frontend

### **Problem: API Returns 0 (Network Error)**

**DevTools shows Status: 0:**

1. Verify backend is still running:
   - Paste in browser: `https://modular-saas-backend.onrender.com/api/health`
   - Should return: `{"status":"ok"}`

2. If not working, check backend service status:
   - Render dashboard → Backend service
   - Should show green dot

3. If red, restart it:
   - Click "..." → "Restart service"

---

## 📊 FINAL CHECKLIST

Before calling Phase 4 complete:

- [ ] Dockerfile created in `frontend/Dockerfile`
- [ ] .dockerignore created in `frontend/.dockerignore`
- [ ] Both files committed and pushed to GitHub
- [ ] Frontend service created in Render
- [ ] Environment variables set (NEXT_PUBLIC_API_URL, NODE_ENV)
- [ ] Deployment completed (green dot in Render)
- [ ] Frontend URL accessible in browser
- [ ] DevTools console shows NO red errors
- [ ] API calls show 200 responses
- [ ] Backend CORS updated for frontend URL
- [ ] Backend is still running (green dot)

---

## 🎉 SUCCESS INDICATORS

When Phase 4 is complete, you'll have:

```
✅ Frontend: https://modular-saas-frontend.onrender.com
✅ Backend: https://modular-saas-backend.onrender.com
✅ Database: PostgreSQL with 7 migrations
✅ Both services running in Render
✅ Frontend connected to backend
✅ Self-hosted, complete infrastructure
✅ 100% PRODUCTION DEPLOYMENT COMPLETE!
```

---

## 🚀 REPORT BACK WHEN DONE

After frontend is deployed and verified:

```
"Phase 4 complete! Frontend at: https://modular-saas-frontend.onrender.com"
```

Then we can proceed with:
- ✅ Feature development (Token Wallet, Rewards, MedBed)
- ✅ Automated testing
- ✅ Error monitoring

---

## ⏱️ TIME TRACKING

```
Step 1 (Dockerfile):     2 min
Step 2 (.dockerignore):  1 min
Step 3 (Commit):         2 min
Step 4 (Render deploy): 15-20 min  ← Longest part
Step 5 (Verify):         5 min
─────────────────────────────────
TOTAL:                  ~30-45 min

🎯 ETA to 100%: ~45 minutes from now
```

---

**Let's go! 🚀 Follow the steps above and you'll have both services self-hosted in Render!**
