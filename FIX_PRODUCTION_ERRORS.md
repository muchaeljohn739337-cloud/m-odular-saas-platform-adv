# 🚨 Fix Critical Production Errors

## ⚠️ Errors You're Seeing:

```
1. ❌ 413 Error - Payload Too Large
2. ❌ 404 Error - Service Worker not found (sw.js)
3. ❌ 500 Error - NextAuth server configuration
4. ❌ ERR_CONNECTION_REFUSED - localhost:4000 (wrong API URL)
```

---

## 🎯 **Root Causes & Fixes:**

### **Problem 1: Frontend Using localhost:4000** ❌

**Error:**
```
GET http://localhost:4000/api/system/status net::ERR_CONNECTION_REFUSED
POST http://localhost:4000/api/rpa/auto-resolve net::ERR_CONNECTION_REFUSED
```

**Root Cause:** Frontend environment variable is still pointing to localhost instead of production API.

**Fix:** Update `NEXT_PUBLIC_API_URL` in Render

---

### **Problem 2: NextAuth 500 Error** ❌

**Error:**
```
GET https://advanciapayledger.com/api/auth/session 500 (Internal Server Error)
[next-auth][error][CLIENT_FETCH_ERROR] There is a problem with the server configuration
```

**Root Cause:** Missing or incorrect `NEXTAUTH_SECRET` and `NEXTAUTH_URL` environment variables.

**Fix:** Add NextAuth configuration to frontend

---

### **Problem 3: Service Worker 404** ❌

**Error:**
```
Service Worker registration failed: TypeError: Failed to register...
A bad HTTP response code (404) was received when fetching the script.
sw.js - 404 Not Found
```

**Root Cause:** ServiceWorkerRegistration component is trying to register a service worker that doesn't exist.

**Fix:** Disable service worker registration (not needed for now)

---

### **Problem 4: 413 Payload Too Large** ⚠️

**Error:**
```
server responded with a status of 413 ()
```

**Root Cause:** Request payload exceeds server limits (usually CloudFront or Render).

**Fix:** This error is being handled by your custom error page, but we should increase payload limits.

---

## 🔧 **IMMEDIATE FIXES REQUIRED:**

### **Fix 1: Update Frontend Environment Variables** 🔴 CRITICAL

**Go to Render Dashboard:**
1. https://dashboard.render.com/
2. Click: **modular-saas-frontend**
3. Click: **Environment** (left sidebar)

**Add/Update these variables:**

```bash
# Update existing variable
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com

# Add these NEW variables
NEXTAUTH_SECRET=793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc67613815691ccc2ab55
NEXTAUTH_URL=https://advanciapayledger.com
```

**Click "Save Changes"** → Frontend will auto-redeploy (3-5 min)

---

### **Fix 2: Disable Service Worker** 🔴 CRITICAL

We need to temporarily disable the service worker registration.

**Option A: Quick Fix (Recommended)**
I'll update the ServiceWorkerRegistration component to skip registration in production.

**Option B: Remove Component**
Remove the `<ServiceWorkerRegistration />` from layout.tsx.

---

### **Fix 3: Verify Backend Environment Variables**

**Go to Render Dashboard:**
1. https://dashboard.render.com/
2. Click: **advancia-backend**
3. Click: **Environment**

**Verify these exist:**

```bash
NODE_ENV=production
BACKEND_URL=https://api.advanciapayledger.com
CORS_ORIGIN=https://advanciapayledger.com
JWT_SECRET=[your 48-character secret]
DATABASE_URL=[your PostgreSQL URL]
ETH_PROVIDER_URL=https://ethereum.publicnode.com
```

**If CORS_ORIGIN is wrong, update it!**

---

## 📋 **Step-by-Step Fix Process:**

### **Step 1: Update Frontend Environment (5 minutes)**

1. **Render Dashboard** → `modular-saas-frontend` → Environment

2. **Find:** `NEXT_PUBLIC_API_URL`
   - **Change from:** `http://localhost:4000` or `https://advancia-backend.onrender.com`
   - **Change to:** `https://api.advanciapayledger.com`

3. **Add:** `NEXTAUTH_SECRET`
   - **Value:** `793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc67613815691ccc2ab55`

4. **Add:** `NEXTAUTH_URL`
   - **Value:** `https://advanciapayledger.com`

5. **Click:** "Save Changes"

6. **Wait:** 3-5 minutes for redeploy

---

### **Step 2: Fix Service Worker Issue (Now)**

I'll update the code to disable service worker in production:

**File:** `frontend/src/components/ServiceWorkerRegistration.tsx`

Change to only register in development:

```typescript
useEffect(() => {
  // Only register service worker in development
  if (process.env.NODE_ENV === 'development' && 'serviceWorker' in navigator) {
    // ... registration code
  }
}, []);
```

---

### **Step 3: Test After Fixes (10 minutes after redeploy)**

```powershell
# Open your site
start https://advanciapayledger.com

# Press F12 → Console tab
# Should NO LONGER see:
# ❌ localhost:4000 errors
# ❌ Service Worker 404 errors  
# ❌ NextAuth 500 errors

# Should see:
# ✅ Requests to api.advanciapayledger.com
# ✅ No connection errors
```

---

## 🎯 **Final Environment Variables:**

### **Frontend (modular-saas-frontend):**
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com  ← UPDATED!
NODE_ENV=production

# NextAuth
NEXTAUTH_SECRET=793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc67613815691ccc2ab55  ← NEW!
NEXTAUTH_URL=https://advanciapayledger.com  ← NEW!

# App Name
NEXT_PUBLIC_APP_NAME=Advancia Pay Ledger

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SCrKDBRIxWx70ZdsfIT1MSMDyFYa0ke914P8qFm3knW16wmc7a4SLLx21I8dObEaGnx4IQcbTR5ZQoTnqNoZsIZ002l4i6QpB

# Botpress
NEXT_PUBLIC_BOTPRESS_BOT_ID=77ea23f8-6bf2-4647-9d24-bcc0fdc3281d

# Web Push
NEXT_PUBLIC_VAPID_KEY=BLO1Omk_gOvP5kAG55P03sqh0poZ83S-saELgN4GDSTwMcWZ7xCsCIWQpY1vlLiqWSwNcZDLIk-txmLbPYjFww8
```

### **Backend (advancia-backend):**
```bash
# Core
NODE_ENV=production
BACKEND_URL=https://api.advanciapayledger.com
CORS_ORIGIN=https://advanciapayledger.com  ← VERIFY THIS!

# Security
JWT_SECRET=[your secret]

# Database
DATABASE_URL=postgresql://[your database]

# Ethereum
ETH_PROVIDER_URL=https://ethereum.publicnode.com

# Twilio
TWILIO_ACCOUNT_SID=AC437680f4bacdc2d19c0f5c6d3f43d7df
TWILIO_AUTH_TOKEN=ddf48b20cc428e610fa8f7debe5a6c2e
TWILIO_PHONE_NUMBER=+17174695102
TWILIO_VERIFY_SERVICE_SID=VAe6a39002df29f79be8bd961927028a47
TWILIO_API_KEY_SID=SK295f3b2039dc66ae9381b3a30e93fda6
TWILIO_API_KEY_SECRET=7X5ZhHNmNUDwgTBtl7SOcJneDxJbhJ1F
```

---

## 🧪 **After All Fixes Applied:**

### **What You Should See:**

✅ **Console:**
```
No localhost:4000 errors
No Service Worker 404 errors
No NextAuth 500 errors
All API calls to api.advanciapayledger.com
```

✅ **Network Tab:**
```
GET https://api.advanciapayledger.com/health → 200 OK
GET https://advanciapayledger.com/api/auth/session → 200 OK
POST https://api.advanciapayledger.com/api/system/status → 200 OK
```

✅ **Site Behavior:**
```
Login page loads correctly
Can register/login
Dashboard accessible
No error messages
```

---

## ⏱️ **Timeline:**

1. **Update frontend env vars:** 2 minutes
2. **Frontend redeploy:** 3-5 minutes
3. **Fix service worker code:** 2 minutes (I'll do this)
4. **Commit & push:** 1 minute
5. **Frontend redeploy again:** 3-5 minutes
6. **Test:** 2 minutes

**Total:** ~15-20 minutes to fully fix

---

## 🚨 **ACTION REQUIRED NOW:**

### **You Need To Do:**

1. Go to: https://dashboard.render.com/
2. Click: **modular-saas-frontend**
3. Click: **Environment**
4. Update `NEXT_PUBLIC_API_URL` to: `https://api.advanciapayledger.com`
5. Add `NEXTAUTH_SECRET`: `793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc67613815691ccc2ab55`
6. Add `NEXTAUTH_URL`: `https://advanciapayledger.com`
7. Click "Save Changes"

### **I Will Do:**

1. Fix ServiceWorkerRegistration component
2. Commit and push changes
3. Guide you through testing

---

## 📞 **After You Update Env Vars:**

**Tell me:** "Done updating env vars"

**Then I'll:**
1. Fix the service worker code
2. Push to GitHub (triggers auto-redeploy)
3. Help you test everything

---

## ✅ **Checklist:**

- [ ] Update `NEXT_PUBLIC_API_URL` in Render frontend
- [ ] Add `NEXTAUTH_SECRET` in Render frontend
- [ ] Add `NEXTAUTH_URL` in Render frontend
- [ ] Save changes (triggers redeploy)
- [ ] Wait for redeploy (3-5 min)
- [ ] Fix service worker code (I'll do this)
- [ ] Test site (no more errors)

---

**Start with updating those 3 environment variables in Render now!** 🚀

Then let me know when you're done so I can fix the code issues!
