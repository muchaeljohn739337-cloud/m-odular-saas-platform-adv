# 🌐 Setup Backend Custom Domain

## 🎯 Goal:
Configure custom domain for backend API instead of using `advancia-backend.onrender.com`

---

## 📋 **Recommended Subdomain:**

```
api.advanciapayledger.com
```

**Why this subdomain?**
- ✅ Professional: `api.advanciapayledger.com`
- ✅ Clear purpose (API endpoints)
- ✅ Matches frontend domain
- ✅ Easy to remember

---

## 🚀 **Step-by-Step Setup:**

### **Step 1: Add Custom Domain in Render**

1. **Go to:** https://dashboard.render.com/
2. **Click:** "advancia-backend" service
3. **Click:** "Settings" (left sidebar)
4. **Scroll to:** "Custom Domain" section
5. **Click:** "Add Custom Domain"
6. **Enter:** `api.advanciapayledger.com`
7. **Click:** "Save"

**Render will show you DNS instructions** like:

```
Add this CNAME record to your DNS:

Name: api
Type: CNAME
Target: advancia-backend.onrender.com
```

---

### **Step 2: Add CNAME Record in Cloudflare**

1. **Go to:** https://dash.cloudflare.com/
2. **Select:** advanciapayledger.com
3. **Click:** DNS → Records
4. **Click:** "Add record"

**Add this CNAME:**

| Type | Name | Target | Proxy Status | TTL |
|------|------|--------|--------------|-----|
| CNAME | `api` | `advancia-backend.onrender.com` | **⚫ GRAY (DNS only)** | Auto |

**CRITICAL:** Make sure Proxy Status is **GRAY** (DNS only), NOT orange!

5. **Click:** "Save"

---

### **Step 3: Wait for SSL Certificate**

**Render will automatically:**
- ✅ Detect the DNS record
- ✅ Provision SSL certificate (Let's Encrypt)
- ✅ Enable HTTPS for your custom domain
- ⏱️ Takes 5-15 minutes

**Check status in Render:**
- Settings → Custom Domain
- Should show: "✅ Verified" and "🔒 SSL Active"

---

### **Step 4: Update Frontend Environment Variable**

Once backend custom domain is working, update frontend:

1. **Render Dashboard** → modular-saas-frontend → Environment
2. **Find:** `NEXT_PUBLIC_API_URL`
3. **Update from:**
   ```
   https://advancia-backend.onrender.com
   ```
4. **Update to:**
   ```
   https://api.advanciapayledger.com
   ```
5. **Click:** "Save Changes"
6. **Wait 3-5 minutes** for frontend redeploy

---

### **Step 5: Update Backend Environment (CORS)**

Update backend to accept requests from frontend:

1. **Render Dashboard** → advancia-backend → Environment
2. **Update:** `CORS_ORIGIN`
   ```
   https://advanciapayledger.com
   ```
3. **Update:** `BACKEND_URL` (optional but recommended)
   ```
   https://api.advanciapayledger.com
   ```
4. **Click:** "Save Changes"

---

## 📊 **Before vs After:**

### **Before (Default Render URLs):**
```
Frontend: https://advanciapayledger.com ✅
Backend:  https://advancia-backend.onrender.com
```

### **After (Custom Domains):**
```
Frontend: https://advanciapayledger.com ✅
Backend:  https://api.advanciapayledger.com ✅
```

**Much more professional!** ✨

---

## 🧪 **Test After Setup:**

### **Test 1: DNS Resolution**
```powershell
nslookup api.advanciapayledger.com
```
**Expected:** Should resolve to Render's IP address

### **Test 2: Health Endpoint**
```powershell
curl https://api.advanciapayledger.com/health
```
**Expected:** `{"status":"healthy","timestamp":"..."}`

### **Test 3: From Frontend**
1. Open: `https://advanciapayledger.com`
2. Try to register/login
3. Check DevTools → Network tab
4. Should see requests to: `https://api.advanciapayledger.com/api/auth/...`

---

## 📋 **Your Final Cloudflare DNS Should Look Like:**

```
Type    Name    Target                              Proxy   TTL
----    ----    ------                              -----   ---
CNAME   @       modular-saas-frontend.onrender.com  ⚫      Auto
CNAME   www     modular-saas-frontend.onrender.com  ⚫      Auto
CNAME   api     advancia-backend.onrender.com       ⚫      Auto  ← NEW!
```

**All should be GRAY cloud ⚫ (DNS only)**

---

## 🔒 **SSL Certificate:**

Render automatically provisions SSL certificates from Let's Encrypt.

**Status Check:**
1. Render → advancia-backend → Settings → Custom Domain
2. Should show:
   ```
   api.advanciapayledger.com
   Status: ✅ Verified
   SSL: 🔒 Active
   ```

**If SSL not ready:**
- Wait 10-15 minutes
- DNS propagation takes time
- Render retries certificate provisioning automatically

---

## 🎯 **Environment Variables After Setup:**

### **Backend (advancia-backend):**
```
JWT_SECRET = [your secret]
DATABASE_URL = postgresql://[database]
NODE_ENV = production
CORS_ORIGIN = https://advanciapayledger.com
BACKEND_URL = https://api.advanciapayledger.com  ← Updated!
```

### **Frontend (modular-saas-frontend):**
```
NEXT_PUBLIC_API_URL = https://api.advanciapayledger.com  ← Updated!
NODE_ENV = production
```

---

## ⚠️ **Common Issues:**

### **Issue 1: "DNS not propagated"**

**Check:**
```powershell
nslookup api.advanciapayledger.com
```

**If no result:**
- Wait 5-10 minutes for DNS propagation
- Verify CNAME record in Cloudflare is correct
- Make sure it's GRAY cloud (not orange)

---

### **Issue 2: "SSL certificate pending"**

**In Render Custom Domain section:**
```
Status: ⏳ Verifying...
SSL: ⏳ Pending
```

**Solution:**
- Wait 10-15 minutes
- DNS must propagate first
- Render auto-retries every few minutes
- Will show ✅ Verified when ready

---

### **Issue 3: "CORS error after switching"**

**Check:**
1. Backend `CORS_ORIGIN` = `https://advanciapayledger.com` ✅
2. Frontend `NEXT_PUBLIC_API_URL` = `https://api.advanciapayledger.com` ✅
3. Both services redeployed after env changes ✅

---

## 📸 **What You Should See:**

### **In Render (Backend Settings → Custom Domain):**
```
┌─────────────────────────────────────────────┐
│ Custom Domains                              │
├─────────────────────────────────────────────┤
│                                             │
│ api.advanciapayledger.com                   │
│ Status: ✅ Verified                         │
│ SSL: 🔒 Active                              │
│                                             │
│ [Add Custom Domain]                         │
└─────────────────────────────────────────────┘
```

### **In Cloudflare DNS:**
```
┌─────────────────────────────────────────────┐
│ DNS Records                                 │
├─────────────────────────────────────────────┤
│ CNAME  api  advancia-backend.onrender.com  │
│        Proxy: ⚫ DNS only                    │
│        TTL: Auto                            │
└─────────────────────────────────────────────┘
```

---

## 🚀 **Quick Setup Summary:**

1. **Render** → Backend → Settings → Add Custom Domain: `api.advanciapayledger.com`
2. **Cloudflare** → DNS → Add CNAME: `api` → `advancia-backend.onrender.com` (GRAY)
3. **Wait** 10-15 minutes for SSL certificate
4. **Update** frontend env: `NEXT_PUBLIC_API_URL = https://api.advanciapayledger.com`
5. **Update** backend env: `BACKEND_URL = https://api.advanciapayledger.com`
6. **Test** health endpoint: `curl https://api.advanciapayledger.com/health`
7. **Done!** ✅

---

## 🎯 **Benefits of Custom Backend Domain:**

✅ **Professional:** `api.advanciapayledger.com` vs `advancia-backend.onrender.com`  
✅ **Branding:** All URLs under your domain  
✅ **Flexibility:** Can move to different hosting without changing frontend  
✅ **Trust:** Users see your domain name only  
✅ **SSL:** Free Let's Encrypt certificate  

---

## 📞 **Need Help?**

**Share with me:**
1. Screenshot of Render Custom Domain section
2. Screenshot of Cloudflare DNS records
3. Any error messages

**I'll help you get it working!** 🚀

---

## ✅ **Checklist:**

- [ ] Add custom domain in Render backend
- [ ] Add CNAME record in Cloudflare (GRAY cloud!)
- [ ] Wait for SSL certificate (10-15 min)
- [ ] Update frontend `NEXT_PUBLIC_API_URL`
- [ ] Update backend `BACKEND_URL`
- [ ] Test health endpoint
- [ ] Test frontend → backend connection
- [ ] Verify no CORS errors

---

**Start with Step 1: Add custom domain in Render backend!** 🎯
