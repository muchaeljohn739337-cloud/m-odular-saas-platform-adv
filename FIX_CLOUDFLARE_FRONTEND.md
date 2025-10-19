# 🔧 Fix Cloudflare DNS to Point to Frontend

## ❌ Current Problem:
- Domain: `advanciapayledger.com`
- Error: Cloudflare Error 1000 - DNS points to prohibited IP
- Cause: DNS pointing to Cloudflare proxy IPs instead of Render servers

## ✅ Solution: Point Domain to Render Frontend

### **Step 1: Get Your Render Frontend URL**

1. **Go to:** https://dashboard.render.com/
2. **Click on:** Your frontend service (the one you just deployed successfully)
3. **Look for the URL** at the top (e.g., `https://advancia-frontend-xyz.onrender.com`)
4. **Copy this URL** - you'll need it

---

### **Step 2: Add Custom Domain in Render**

1. **In your Render frontend service**, click **"Settings"** (left sidebar)
2. Scroll to **"Custom Domain"** section
3. Click **"Add Custom Domain"**
4. Enter: `advanciapayledger.com`
5. Click **"Save"**
6. **Render will show you DNS instructions** - copy the CNAME target or IP address

**Example of what Render shows:**
```
To use advanciapayledger.com, add this CNAME record in your DNS:

Name: @
Target: [something].onrender.com
```

OR

```
To use advanciapayledger.com, add this A record:

Name: @
IPv4: [IP address from Render]
```

📝 **Write down** what Render tells you - you'll use this in Step 3!

---

### **Step 3: Update Cloudflare DNS Records**

1. **Go to:** https://dash.cloudflare.com/
2. **Select your domain:** `advanciapayledger.com`
3. **Click:** DNS → Records

#### **Option A: If Render Gave You a CNAME (Most Common)**

4. **Find the existing A records** for `@` (root domain)
5. **Delete ALL existing A records** for `@`
6. **Click "Add record"**
7. **Create CNAME record:**
   - **Type:** CNAME
   - **Name:** `@`
   - **Target:** `[the target from Render]` (e.g., `advancia-frontend.onrender.com`)
   - **Proxy status:** 🟡 **Click the cloud to make it GRAY** (DNS only - IMPORTANT!)
   - **TTL:** Auto
8. **Click "Save"**

#### **Option B: If Render Gave You an IP Address**

4. **Find the existing A records** for `@` (root domain)
5. **Click on each A record** and edit it:
   - **IPv4 address:** [IP from Render]
   - **Proxy status:** 🟡 **Click the cloud to make it GRAY** (DNS only)
   - **TTL:** Auto
6. **Delete any extra A records** (you should have only ONE)
7. **Click "Save"**

---

### **Step 4: Also Update Your API Subdomain (Backend)**

Since your backend is at `https://advancia-backend.onrender.com`, let's also fix the `api` subdomain:

1. **In Cloudflare DNS**, find the A record for `api`
2. **Delete it** (or edit if you want to keep the subdomain)
3. **Optional:** Create new CNAME:
   - **Type:** CNAME
   - **Name:** `api`
   - **Target:** `advancia-backend.onrender.com`
   - **Proxy status:** 🟡 GRAY (DNS only)
   - **TTL:** Auto

---

### **Step 5: Verify Configuration**

**Wait 2-5 minutes** for DNS propagation, then test:

1. **Open browser** (incognito/private mode)
2. **Go to:** `http://advanciapayledger.com` (try without https first)
3. **You should see** your frontend loading! 🎉

If you see a certificate warning, that's normal - Render will automatically provision SSL within 24 hours.

**Test command in PowerShell:**
```powershell
nslookup advanciapayledger.com
```

**Expected result:** Should show Render's IP, NOT Cloudflare's proxy IPs

---

## 🔑 Critical Settings:

### **✅ MUST DO:**
- ✅ Proxy status: **GRAY cloud** (DNS only) - NOT orange!
- ✅ Delete old A records pointing to Cloudflare IPs
- ✅ Use CNAME or A record from Render (not your own IPs)

### **❌ DON'T DO:**
- ❌ Don't use orange cloud (Cloudflare proxy)
- ❌ Don't use the old IPs (104.21.31.34, 172.67.174.235)
- ❌ Don't use Cloudflare's "Automatic HTTPS Rewrites" (not needed with Render)

---

## 📋 Quick Checklist:

- [ ] Get frontend URL from Render dashboard
- [ ] Add custom domain in Render → Get DNS instructions
- [ ] Delete old A records in Cloudflare
- [ ] Add new CNAME or A record (GRAY cloud only!)
- [ ] Wait 2-5 minutes for DNS propagation
- [ ] Test: Open advanciapayledger.com in browser
- [ ] Verify: Run `nslookup advanciapayledger.com`

---

## 🆘 If You Get Stuck:

**Problem:** "I can't find the CNAME/IP from Render"
- **Solution:** In Render dashboard → Your frontend service → Settings → Custom Domain → The instructions are right there after you add the domain

**Problem:** "Cloudflare won't let me use CNAME for root domain"
- **Solution:** Cloudflare supports CNAME flattening. Make sure you're setting the "Name" field to `@` (not blank)

**Problem:** "Still seeing Error 1000"
- **Solution:** Make sure the cloud is GRAY (not orange). Clear your browser cache and wait 5 minutes.

**Problem:** "Certificate error"
- **Solution:** Normal! Render provisions SSL automatically. Use `http://` for now, it will redirect to `https://` once SSL is ready (usually within 1 hour).

---

## 🎯 After This Works:

Once you can access `advanciapayledger.com` successfully:

1. ✅ Update your frontend environment variable:
   - In Render → Frontend service → Environment
   - Update `CORS_ORIGIN` (if needed) to include `https://advanciapayledger.com`

2. ✅ Update your backend CORS settings:
   - In Render → Backend service → Environment
   - Update `CORS_ORIGIN` to `https://advanciapayledger.com`

3. ✅ Test login/register functionality

---

## 📞 Need Help?

Tell me:
1. What step you're on
2. What you see in Render when you add custom domain
3. What error you're getting (if any)

Let's get your domain working! 🚀
