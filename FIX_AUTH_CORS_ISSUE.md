# 🔧 Fix Authentication & OTP Fetch Errors

## ❌ Current Problem:
- Auth errors on frontend
- One-time code (OTP) can't be fetched
- Root Cause: **CORS blocking** - Backend doesn't allow requests from `https://advanciapayledger.com`

---

## ✅ Solution: Update Backend Environment Variables

### **Step 1: Go to Render Backend Service**

1. **Go to:** https://dashboard.render.com/
2. **Click:** Your **"advancia-backend"** service
3. **Click:** "Environment" (left sidebar)

---

### **Step 2: Add/Update These Environment Variables**

Look for these variables and UPDATE or ADD them:

#### **Option A: If you have `CORS_ORIGIN`:**

**Find:** `CORS_ORIGIN`  
**Update to:** `https://advanciapayledger.com`

Click **"Save Changes"**

#### **Option B: If you have `FRONTEND_URL`:**

**Find:** `FRONTEND_URL`  
**Update to:** `https://advanciapayledger.com`

Click **"Save Changes"**

#### **Option C: If you have NEITHER (Add new variable):**

**Click "Add Environment Variable"**

**Key:** `FRONTEND_URL`  
**Value:** `https://advanciapayledger.com`

Click **"Save Changes"**

---

### **Step 3: Service Will Auto-Redeploy**

After saving:
- Render will automatically redeploy your backend (takes 2-3 minutes)
- Wait for the "Live" badge to appear
- Your backend will now accept requests from your frontend domain

---

## 🎯 What Your Backend Environment Should Look Like:

```
JWT_SECRET = [your 48-character secret]
DATABASE_URL = postgresql://[your database url]
NODE_ENV = production
FRONTEND_URL = https://advanciapayledger.com  ← ADD/UPDATE THIS
BACKEND_URL = https://advancia-backend.onrender.com
```

---

## 🧪 After Backend Redeploys - Test It:

### **Test 1: Check CORS is working**

Open browser console (F12) and run:
```javascript
fetch('https://advancia-backend.onrender.com/health')
  .then(r => r.json())
  .then(d => console.log(d))
```

**Expected:** `{status: "healthy", timestamp: "..."}`

### **Test 2: Try OTP request**

Go to your frontend: `https://advanciapayledger.com`
1. Enter email/phone on login
2. Click "Send Code"
3. Should work now! ✅

---

## 🔍 Additional Check: Frontend Environment Variable

Your frontend also needs to know where the backend is.

### **Check Frontend Service:**

1. **Go to:** Render → **"modular-saas-frontend"** service
2. **Click:** "Environment"
3. **Verify this variable exists:**

```
NEXT_PUBLIC_API_URL = https://advancia-backend.onrender.com
```

If missing, **add it** and save.

---

## 📋 Quick Checklist:

**Backend Service:**
- [ ] Go to Render → advancia-backend → Environment
- [ ] Add/Update `FRONTEND_URL` = `https://advanciapayledger.com`
- [ ] Click "Save Changes"
- [ ] Wait 2-3 minutes for redeploy
- [ ] Service shows "Live" badge

**Frontend Service:**
- [ ] Go to Render → modular-saas-frontend → Environment  
- [ ] Verify `NEXT_PUBLIC_API_URL` = `https://advancia-backend.onrender.com`
- [ ] If missing, add it and save

**Test:**
- [ ] Open https://advanciapayledger.com
- [ ] Try logging in / requesting OTP
- [ ] Should work! ✅

---

## 🆘 If Still Not Working:

### **Problem:** "Network Error" or "Failed to fetch"

**Check browser console (F12):**
- Look for CORS errors (red text mentioning "CORS" or "Access-Control-Allow-Origin")
- Take a screenshot and share it

### **Problem:** "Request failed" but no CORS error

**Check backend logs in Render:**
1. Render → advancia-backend → Logs
2. Look for errors when you try to login
3. Share the error message

### **Problem:** OTP not received

**Two possibilities:**
1. **API not connecting:** Fix CORS first (above steps)
2. **Email not sending:** Backend may need email service configuration (we can fix this separately)

---

## 🎯 Summary:

The issue is that your backend is blocking requests from your frontend domain due to CORS policy.

**Quick fix:**
1. Backend → Environment → Add `FRONTEND_URL = https://advanciapayledger.com`
2. Wait 2-3 minutes for redeploy
3. Test login/OTP again
4. Should work! ✅

---

**Let me know once you've updated the backend environment variable!** 🚀
