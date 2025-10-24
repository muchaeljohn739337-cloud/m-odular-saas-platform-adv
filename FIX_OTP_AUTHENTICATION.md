# 🔐 Fix One-Time Code (OTP) Authentication

## ❌ Current Problem:
- Users can't log in
- OTP codes can't be fetched
- Auth errors on frontend

## ✅ Root Cause:
Backend CORS blocking requests from `https://advanciapayledger.com`

---

## 🎯 Quick Fix (5 Minutes):

### **Step 1: Update Backend Environment Variable**

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click:** "advancia-backend" service
3. **Click:** "Environment" (left sidebar)
4. **Find or Add:** `FRONTEND_URL`

**Set value to:**
```
https://advanciapayledger.com
```

5. **Click:** "Save Changes"
6. **Wait 2-3 minutes** for backend to redeploy

---

### **Step 2: Verify Frontend Has API URL**

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click:** "modular-saas-frontend" service  
3. **Click:** "Environment"
4. **Verify exists:** `NEXT_PUBLIC_API_URL`

**Should be:**
```
https://advancia-backend.onrender.com
```

If missing, add it and save.

---

## 🧪 Test After Backend Redeploys:

1. **Open:** https://advanciapayledger.com
2. **Enter email/phone** on login page
3. **Click:** "Send Code" or "Login with One-Time Code"
4. **Expected:** OTP should be sent! ✅

---

## 🔍 Check Backend Logs If Still Not Working:

1. **Render Dashboard** → advancia-backend → **Logs**
2. **Look for:**
   - `🚫 CORS blocked origin:` messages
   - `✅ Using plain JWT secret` (should see this on startup)
   - Auth endpoint access logs

3. **If you see CORS errors:**
   - Make sure `FRONTEND_URL` is exactly: `https://advanciapayledger.com`
   - No trailing slash
   - Must be HTTPS

---

## 📋 Your Backend Environment Should Look Like:

```
JWT_SECRET = [your 48-character secret]
DATABASE_URL = postgresql://[your database]
NODE_ENV = production
FRONTEND_URL = https://advanciapayledger.com  ← ADD THIS!
BACKEND_URL = https://advancia-backend.onrender.com
```

---

## 🎯 After This Fix:

✅ Users can request OTP codes  
✅ Login with one-time code works  
✅ Registration works  
✅ CORS errors gone  

---

**Add that `FRONTEND_URL` environment variable and OTP will work!** 🚀
