# 🔧 502 BAD GATEWAY - TROUBLESHOOTING & FIX GUIDE

**Date:** October 22, 2025, 03:28:50 UTC  
**Status:** ❌ Frontend returning 502 (via Cloudflare)  
**Backend:** ✅ Responding (health endpoint OK)

---

## 🎯 QUICK DIAGNOSIS

### What We Know:

```
❌ Frontend: advanciapayledger.com → 502 Bad Gateway
✅ Backend: api.advanciapayledger.com → Responding (200 OK)
✅ Database: PostgreSQL → Connected
✅ Health Endpoint: /health → Returning valid JSON
```

### Root Cause Analysis:

502 error typically means:

1. Frontend service crashed or not running
2. Frontend build failed or corrupted
3. Frontend can't connect to backend API
4. Port mismatch (frontend expecting different port)
5. Environment variables incorrect on frontend

---

## 🚨 IMMEDIATE ACTION PLAN (Do This First)

### Step 1: Check Render Dashboard

```
1. Go to https://dashboard.render.com
2. Find your frontend service
3. Look for:
   - Service Status (should be "live")
   - Logs tab (look for errors)
   - Deployment tab (check last deployment status)
   - Restart button (if needed)
```

### Step 2: Check Frontend Service Logs

```
Look for common errors:
- Port already in use
- Environment variable missing
- NEXT_PUBLIC_API_URL incorrectly set
- Out of memory
- Build failed
```

### Step 3: Check Environment Variables

```
Frontend needs:
✅ NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
✅ PORT=10000 (or whatever Render assigns)

DON'T hardcode localhost!
```

---

## 🔍 DETAILED TROUBLESHOOTING

### Issue #1: Frontend Service Crashed

**Symptoms:** Service shows "Crashed" or "Down" in Render dashboard

**Fix:**

```powershell
# Option A: Restart via Dashboard
# Click service → More → Restart service

# Option B: Force redeploy via Git
cd c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform
git add .
git commit -m "fix: force redeploy frontend"
git push origin main

# Wait 5 minutes for auto-deploy
```

---

### Issue #2: Environment Variables Wrong

**Symptoms:** Build succeeds but app crashes on startup

**Fix - Update Environment Variables:**

```
1. Go to Render Dashboard
2. Frontend service → Environment
3. Check these variables:

NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NODE_ENV=production
PORT=10000
NEXT_PUBLIC_APP_URL=https://advanciapayledger.com

4. Click "Save changes"
5. Service will auto-restart
6. Wait 2-3 minutes
```

---

### Issue #3: Build Failed

**Symptoms:** Deployment logs show build errors

**Fix:**

```powershell
# 1. Test build locally
cd frontend
npm run build

# If errors:
npm install  # Reinstall dependencies
npm run build  # Try again

# 2. Check for TypeScript errors
npx tsc --noEmit

# 3. Fix any errors found

# 4. Commit and push
git add .
git commit -m "fix: resolve build errors"
git push origin main
```

---

### Issue #4: API Connection Failed

**Symptoms:** Frontend loads but API calls fail

**Check:**

```
1. Verify NEXT_PUBLIC_API_URL in .env.local (development)
2. Verify Environment Variables in Render (production)
3. Check CORS settings in backend

Backend should have CORS enabled for:
- https://advanciapayledger.com
- https://www.advanciapayledger.com
```

**Fix in backend `src/index.ts`:**

```typescript
// Ensure CORS includes your domain
const allowedOrigins = [
  "https://advanciapayledger.com",
  "https://www.advanciapayledger.com",
  process.env.FRONTEND_URL || "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
```

---

### Issue #5: Port Configuration Wrong

**Symptoms:** App starts but won't bind to port

**Check Render.yaml:**

```yaml
services:
  - type: web
    name: advancia-frontend
    runtime: docker
    dockerfilePath: frontend/Dockerfile
    port: 10000 # Make sure this matches
    startCommand: node server.js
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://api.advanciapayledger.com
      - key: PORT
        value: 10000
```

---

## 🛠️ STEP-BY-STEP FIX SEQUENCE

### Step 1: Verify Backend Health (5 min)

```powershell
# Test backend
$response = curl -s https://api.advanciapayledger.com/health
Write-Host $response

# Should return JSON like:
# {"status":"healthy","timestamp":"2025-10-22T03:30:00Z"...}

# If this fails, backend is the issue
```

### Step 2: Check Frontend Logs (5 min)

```
Render Dashboard → Frontend service → Logs

Look for:
- ERROR: [error text]
- FATAL: [crash reason]
- Cannot find module [package]
- EADDRINUSE: port [number] already in use
```

### Step 3: Verify Environment Variables (5 min)

```
Render Dashboard → Frontend → Environment

Check:
✅ NEXT_PUBLIC_API_URL = https://api.advanciapayledger.com
✅ PORT = 10000
✅ NODE_ENV = production
✅ NODE_OPTIONS (if set, check value)
```

### Step 4: Restart Service (3 min)

```
Render Dashboard → Frontend → More → Restart service

Wait for service to restart (usually 30-60 seconds)
Check status changes from "Updating" to "Live"
```

### Step 5: Test in Browser (2 min)

```
Visit: https://advanciapayledger.com
Should load (no 502 error)

Open DevTools (F12) → Network tab
Check if assets load successfully
Check if API calls go to https://api.advanciapayledger.com
```

### Step 6: If Still Broken - Force Redeploy (5 min)

```powershell
cd c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform

# Make a small change to trigger redeploy
echo "# Force redeploy $(Get-Date)" >> README.md

git add .
git commit -m "fix: force frontend redeploy"
git push origin main

# GitHub Actions will trigger
# Render will auto-deploy (takes 3-5 minutes)
# Monitor logs during deployment
```

---

## 📋 COMMON 502 ERRORS & FIXES

| Error                 | Cause                            | Fix                         |
| --------------------- | -------------------------------- | --------------------------- |
| "Service Unavailable" | Service crashed                  | Restart via Render          |
| "Bad Gateway"         | API unreachable                  | Check CORS + API URL        |
| "502 Timeout"         | Service taking too long to start | Increase timeout or restart |
| "Connection refused"  | Port not listening               | Check PORT env var          |
| "Cannot find module"  | Dependency missing               | Run npm install, rebuild    |

---

## 🚨 NUCLEAR OPTION (Last Resort)

If nothing works:

### Option 1: Delete & Recreate Frontend Service

```
1. Render Dashboard → Frontend service
2. Settings → Delete service
3. Wait 2 minutes
4. Create new web service
5. Connect to same GitHub repo
6. Set environment variables
7. Deploy
```

### Option 2: Manual Docker Rebuild

```powershell
# Push to trigger rebuild
git add .
git commit -m "fix: manual rebuild trigger"
git push origin main --force

# In Render dashboard:
# Click "Deploy latest" button (if available)
# Or wait for auto-deploy
```

---

## ✅ VERIFICATION CHECKLIST

After applying fixes, verify:

- [ ] Backend health endpoint responds: `https://api.advanciapayledger.com/health`
- [ ] Frontend loads: `https://advanciapayledger.com`
- [ ] No 502 error displayed
- [ ] Console (DevTools) shows no CORS errors
- [ ] Can login to platform
- [ ] Can access dashboard
- [ ] Real-time features work (Socket.IO connecting)
- [ ] API calls succeed (Network tab shows 200/201)

---

## 📊 MONITORING GOING FORWARD

### Set Up Alerts (Optional but Recommended)

**Render Built-in:**

1. Dashboard → Frontend service → Settings
2. Enable "Notification on deployment failure"
3. Add email address

**Better Option - Uptime Monitor:**

```
Services:
1. https://advanciapayledger.com/health → Should return 200
2. https://api.advanciapayledger.com/health → Should return 200

Check every: 5 minutes
Alert if down: Immediately
```

---

## 🎯 YOUR NEXT STEPS

**RIGHT NOW:**

1. ✅ Go to Render Dashboard
2. ✅ Check Frontend service status
3. ✅ Look at recent logs
4. ✅ Try restarting service
5. ✅ Test in browser

**IF THAT DOESN'T WORK:**

6. ✅ Check environment variables
7. ✅ Force redeploy via Git push
8. ✅ Wait 5 minutes
9. ✅ Test again

**IF STILL BROKEN:**

10. ✅ Delete and recreate service
11. ✅ Or delete frontend, redeploy from scratch

---

## 💬 QUESTIONS TO ANSWER

To debug faster, check:

1. **When did it break?**

   - Right after deployment?
   - Suddenly during operation?
   - After code changes?

2. **What changed recently?**

   - Any environment variable updates?
   - Any code commits?
   - Any Render configuration changes?

3. **What do the logs say?**

   - Render Dashboard → Logs
   - Look for ERROR, FATAL, or CRASHED messages

4. **Is backend working?**
   - Test: `curl https://api.advanciapayledger.com/health`
   - Should return 200 OK with JSON

---

## 🚀 QUICK LINKS

- **Render Dashboard:** https://dashboard.render.com
- **Frontend Logs:** Dashboard → Frontend service → Logs
- **GitHub Actions:** https://github.com/pdtribe181-prog/-modular-saas-platform/actions
- **Frontend URL:** https://advanciapayledger.com
- **Backend URL:** https://api.advanciapayledger.com/health

---

## ❓ STILL STUCK?

If this guide doesn't fix it, provide:

1. Frontend service status from Render
2. Last 50 lines of frontend logs
3. Environment variables (hide secrets)
4. When the error started
5. What was deployed before it broke

Then we can debug deeper! 🔍
