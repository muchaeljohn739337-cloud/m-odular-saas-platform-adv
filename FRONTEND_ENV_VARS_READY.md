# 🚀 FRONTEND ENVIRONMENT VARIABLES - READY TO COPY

**For:** Render (when deploying frontend service)  
**Status:** Ready to paste directly into Render Environment tab  
**Time to deploy:** ~30-45 minutes after this

---

## 📋 COPY THIS FOR FRONTEND RENDER SERVICE

When you create the frontend service in Render, add these environment variables:

### **Variable 1 - NEXT_PUBLIC_API_URL**

```
NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com
```

**Copy:** `NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com`

---

### **Variable 2 - NODE_ENV**

```
NODE_ENV=production
```

**Copy:** `NODE_ENV=production`

---

## 📊 SUMMARY TABLE

Paste into Render like this:

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://advancia-backend.onrender.com` |
| `NODE_ENV` | `production` |

---

## 🎯 STEP-BY-STEP IN RENDER

### **Step 1: Go to Create Frontend Service**
- Render Dashboard → "New +" → "Web Service"
- Connect GitHub repo: `-modular-saas-platform`
- Root Directory: `frontend`
- Environment: `Docker`

### **Step 2: Scroll to "Environment" Section**
- Click "Add Environment Variable"

### **Step 3: Add Variable 1**
- **Key field:** Copy-paste this:
  ```
  NEXT_PUBLIC_API_URL
  ```
- **Value field:** Copy-paste this:
  ```
  https://advancia-backend.onrender.com
  ```
- Click "Add" or "+" button

### **Step 4: Add Variable 2**
- **Key field:** Copy-paste this:
  ```
  NODE_ENV
  ```
- **Value field:** Copy-paste this:
  ```
  production
  ```
- Click "Add" or "+" button

### **Step 5: Deploy**
- Click "Create Web Service"
- Wait 5-10 minutes
- Done! ✅

---

## 💡 WHY THESE VARIABLES?

| Variable | Purpose | Why? |
|----------|---------|------|
| `NEXT_PUBLIC_API_URL` | Frontend knows where backend is | So frontend can call backend API |
| `NODE_ENV` | Tells Next.js to use production build | Faster, optimized, no dev warnings |

---

## ⚠️ IMPORTANT NOTES

✅ **Both variables start with exact spelling:**
- NOT: `API_URL` (missing `NEXT_PUBLIC_` prefix)
- NOT: `NEXT_PUBLIC_API_ENDPOINT` (wrong name)
- CORRECT: `NEXT_PUBLIC_API_URL` ← Exact!

✅ **Backend URL is exactly:**
- `https://advancia-backend.onrender.com`
- (Your actual service name on Render)

✅ **NODE_ENV is:**
- `production` (lowercase, no quotes)

---

## 🔍 VERIFY THESE ARE CORRECT

After frontend deploys, verify:

1. **Open frontend URL:** `https://modular-saas-frontend.onrender.com`
2. **Press F12** (DevTools)
3. **Go to Console tab**
4. Look for API calls starting with: `https://advancia-backend.onrender.com/api/...`
5. Status should be **200** ✅

If you see:
- ❌ Blank page = Check `NODE_ENV=production`
- ❌ CORS error = Check `NEXT_PUBLIC_API_URL` spelling
- ❌ API 404 = Check backend URL is correct

---

## ✅ YOU'RE READY!

**Everything prepared. Just:**
1. Create frontend service in Render
2. Paste these 2 variables
3. Click Deploy
4. Wait 10 minutes
5. Report back: "Frontend deployed!"

---

**That's all you need for frontend! Simple & clean.** 🎯
