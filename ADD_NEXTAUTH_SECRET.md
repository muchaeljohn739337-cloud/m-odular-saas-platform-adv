# 🔐 ADD NEXTAUTH_SECRET TO FRONTEND

## ⚠️ **URGENT: Frontend Needs NextAuth Secret**

Your frontend is live but NextAuth is throwing errors because it needs a secret in production.

---

## 📍 **YOU ARE HERE → Add NEXTAUTH_SECRET**

### **STEP 1: Go to Frontend Environment Variables**

Click here: **https://dashboard.render.com/web/advancia-frontend**

Then: Click **"Environment"** tab (left sidebar)

### **STEP 2: Add NEXTAUTH_SECRET**

Click **"Add Environment Variable"**

**Fill in:**
```
Key:   NEXTAUTH_SECRET
Value: your-super-secret-nextauth-key-min-32-chars-2025!
```

⚠️ **IMPORTANT:** 
- Must be at least 32 characters long
- Keep it secret!
- You can use the same value as your backend JWT_SECRET or generate a new one

### **STEP 3: Save Changes**

Click **"Save Changes"** at the bottom

Render will automatically redeploy the frontend with the new secret.

---

## 🎯 **Complete Frontend Environment Variables:**

After adding, you should have **4 variables**:

| Key | Value |
|-----|-------|
| NODE_ENV | production |
| NEXT_PUBLIC_API_URL | https://advancia-backend.onrender.com/api |
| PORT | 3000 |
| **NEXTAUTH_SECRET** | **your-super-secret-nextauth-key-min-32-chars-2025!** ← ADD THIS |

---

## 🔧 **Alternative: Generate a Random Secret**

If you want a truly random secret, you can generate one:

**Option 1: Use OpenSSL (in terminal):**
```bash
openssl rand -base64 32
```

**Option 2: Use the same as backend JWT_SECRET:**
```
your-super-secret-jwt-key-min-32-chars-long-2025!
```

---

## ⏱️ **After Adding:**

1. Click "Save Changes"
2. Wait ~1-2 minutes for redeploy
3. Frontend will restart with the secret
4. NextAuth errors will disappear ✅

---

## 📊 **What This Fixes:**

**Current Error:**
```
[next-auth][error][NO_SECRET] 
Please define a `secret` in production.
```

**After Adding NEXTAUTH_SECRET:**
```
✅ NextAuth configured properly
✅ Authentication will work
✅ No more errors in logs
```

---

## 🚀 **Quick Action:**

1. Go to: https://dashboard.render.com/web/advancia-frontend
2. Click: **Environment** tab
3. Click: **Add Environment Variable**
4. Enter:
   - Key: `NEXTAUTH_SECRET`
   - Value: `your-super-secret-nextauth-key-min-32-chars-2025!`
5. Click: **Save Changes**
6. Wait: ~1-2 minutes for redeploy

---

**Do this now, then tell me when you've added it!** 🔐
