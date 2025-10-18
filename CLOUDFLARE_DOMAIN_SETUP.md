# 🌐 Cloudflare Domain Setup Guide
## advanciapayledger.com Configuration

**Domain**: `advanciapayledger.com`  
**DNS Provider**: Cloudflare  
**Platform**: Advancia Pay Ledger  
**Date**: October 18, 2025

---

## 📋 Overview

This guide will help you configure your Cloudflare domain to point to your Render-hosted services (frontend and backend).

---

## 🎯 Architecture

```
advanciapayledger.com (Frontend - Next.js)
    ↓
api.advanciapayledger.com (Backend - Express API)
    ↓
PostgreSQL Database (Render)
```

---

## 🚀 Step-by-Step Configuration

### Step 1: Get Your Render Service URLs

First, you need to get the URLs from your Render services:

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Find Your Services**:
   - Frontend service (Next.js)
   - Backend service (Express API)
3. **Copy the URLs**:
   - Frontend: `your-frontend-app.onrender.com`
   - Backend: `your-backend-api.onrender.com`

---

### Step 2: Configure DNS Records in Cloudflare

#### 🔹 Add Frontend Domain (Root Domain)

1. **Login to Cloudflare**: https://dash.cloudflare.com
2. **Select your domain**: `advanciapayledger.com`
3. **Go to DNS → Records**
4. **Add CNAME Record for Root Domain**:

```
Type:    CNAME
Name:    @  (or advanciapayledger.com)
Target:  your-frontend-app.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied (Orange Cloud ON)
```

#### 🔹 Add API Subdomain

5. **Add CNAME Record for API**:

```
Type:    CNAME
Name:    api
Target:  your-backend-api.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied (Orange Cloud ON)
```

#### 🔹 Add WWW Subdomain (Optional)

6. **Add CNAME Record for WWW**:

```
Type:    CNAME
Name:    www
Target:  your-frontend-app.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied (Orange Cloud ON)
```

---

### Step 3: Configure SSL/TLS Settings

1. **Go to SSL/TLS tab in Cloudflare**
2. **Set SSL/TLS encryption mode**:
   - Select: **Full (strict)**
   - This ensures end-to-end encryption

3. **Enable Always Use HTTPS**:
   - Go to SSL/TLS → Edge Certificates
   - Toggle **Always Use HTTPS**: ON
   - Toggle **Automatic HTTPS Rewrites**: ON

4. **Enable HSTS** (Recommended):
   - Go to SSL/TLS → Edge Certificates
   - Enable **HTTP Strict Transport Security (HSTS)**
   - Settings:
     - Max Age: 6 months
     - Include subdomains: ✅
     - Preload: ✅
     - No-Sniff Header: ✅

---

### Step 4: Configure Custom Domains in Render

#### Frontend (Next.js)

1. **Go to Render Dashboard** → Your Frontend Service
2. **Click "Settings" → "Custom Domains"**
3. **Add Custom Domain**:
   - Domain: `advanciapayledger.com`
   - Click "Add"
4. **Add WWW subdomain**:
   - Domain: `www.advanciapayledger.com`
   - Click "Add"

#### Backend (Express API)

1. **Go to Render Dashboard** → Your Backend Service
2. **Click "Settings" → "Custom Domains"**
3. **Add Custom Domain**:
   - Domain: `api.advanciapayledger.com`
   - Click "Add"

---

### Step 5: Update Environment Variables

#### Backend Service (Render)

Update these environment variables in your Render backend service:

```bash
# Frontend URL
FRONTEND_URL=https://advanciapayledger.com

# Allowed CORS Origins
ALLOWED_ORIGINS=https://advanciapayledger.com,https://www.advanciapayledger.com

# Backend URL (for reference)
BACKEND_URL=https://api.advanciapayledger.com
```

#### Frontend Service (Render)

Update these environment variables in your Render frontend service:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com

# Frontend URL (for redirects)
NEXT_PUBLIC_FRONTEND_URL=https://advanciapayledger.com
```

#### How to Update in Render:

1. Go to your service in Render
2. Click **Environment** tab
3. Update/Add the variables above
4. Click **Save Changes**
5. Service will automatically redeploy

---

### Step 6: Update Local .env Files

#### Backend .env

Update `backend/.env`:

```bash
# Production values (comment out for local development)
# FRONTEND_URL=https://advanciapayledger.com
# BACKEND_URL=https://api.advanciapayledger.com

# Local development (keep these for local work)
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:4000
```

#### Frontend .env.local

Create/Update `frontend/.env.local`:

```bash
# Production values (comment out for local development)
# NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
# NEXT_PUBLIC_FRONTEND_URL=https://advanciapayledger.com

# Local development (keep these for local work)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000
```

---

### Step 7: Configure Cloudflare Page Rules (Optional)

Add these page rules for better performance:

1. **Go to Rules → Page Rules**
2. **Add these rules**:

#### Rule 1: Force HTTPS

```
URL Pattern: http://*advanciapayledger.com/*
Setting: Always Use HTTPS
```

#### Rule 2: Cache API Responses (Selective)

```
URL Pattern: api.advanciapayledger.com/api/health
Settings:
  - Cache Level: Cache Everything
  - Edge Cache TTL: 5 minutes
```

#### Rule 3: WWW to Non-WWW Redirect

```
URL Pattern: www.advanciapayledger.com/*
Settings:
  - Forwarding URL: 301 Permanent Redirect
  - Destination: https://advanciapayledger.com/$1
```

---

### Step 8: Configure Cloudflare Security Settings

#### Firewall Rules

1. **Go to Security → WAF**
2. **Enable Basic Protection**:
   - OWASP Core Ruleset: ON
   - Cloudflare Managed Ruleset: ON

#### Rate Limiting (Free Plan Alternative)

Since you already have rate limiting in your backend, you can optionally add Cloudflare rate limiting as an extra layer:

1. **Go to Security → Rate Limiting Rules**
2. **Add Rule**:
   - Name: "API Rate Limiting"
   - Expression: `(http.host eq "api.advanciapayledger.com")`
   - Requests: 100 per minute
   - Action: Block

#### Bot Fight Mode

1. **Go to Security → Bots**
2. **Enable Bot Fight Mode**: ON (Free)
3. **Super Bot Fight Mode**: Upgrade to Pro for advanced features

---

### Step 9: Configure Cloudflare Performance Settings

1. **Go to Speed → Optimization**
2. **Enable these features**:
   - ✅ Auto Minify: HTML, CSS, JavaScript
   - ✅ Brotli Compression
   - ✅ Early Hints
   - ✅ Rocket Loader (test first, may break some scripts)

3. **Go to Caching → Configuration**:
   - Browser Cache TTL: 4 hours
   - Always Online: ON

---

## 🔍 Verification Steps

### 1. DNS Propagation Check

Wait 5-15 minutes after DNS changes, then check:

```bash
# Windows PowerShell
nslookup advanciapayledger.com
nslookup api.advanciapayledger.com
nslookup www.advanciapayledger.com

# Expected results:
# All should point to Cloudflare IPs (104.x.x.x or 172.x.x.x)
```

Online tools:
- https://dnschecker.org/
- https://www.whatsmydns.net/

### 2. SSL Certificate Check

```bash
# Check SSL certificate
curl -I https://advanciapayledger.com
curl -I https://api.advanciapayledger.com

# Or visit in browser and check padlock icon
```

### 3. CORS Check

```bash
# Test CORS from browser console
fetch('https://api.advanciapayledger.com/health')
  .then(res => res.json())
  .then(data => console.log('✅ API accessible:', data))
  .catch(err => console.error('❌ CORS error:', err))
```

### 4. Health Check

```bash
# Test backend health
curl https://api.advanciapayledger.com/health

# Expected response:
# {"status":"ok","timestamp":"..."}
```

### 5. Frontend Test

1. Visit: https://advanciapayledger.com
2. Test login functionality
3. Check browser console for errors
4. Verify API calls work

---

## 🐛 Troubleshooting

### Issue 1: DNS Not Resolving

**Symptom**: Domain doesn't load, DNS_PROBE_FINISHED_NXDOMAIN

**Solutions**:
1. Wait 15-30 minutes for DNS propagation
2. Clear DNS cache:
   ```powershell
   ipconfig /flushdns
   Clear-DnsClientCache
   ```
3. Try different DNS server (8.8.8.8, 1.1.1.1)
4. Check Cloudflare DNS records are correct

### Issue 2: CORS Errors

**Symptom**: "Access-Control-Allow-Origin" errors in browser console

**Solutions**:
1. Verify `FRONTEND_URL` in backend environment variables
2. Check CORS configuration in `backend/src/index.ts`
3. Ensure Cloudflare proxy is ON (orange cloud)
4. Verify backend is using HTTPS URLs

### Issue 3: SSL Certificate Invalid

**Symptom**: "Your connection is not private" error

**Solutions**:
1. Check Cloudflare SSL/TLS mode is "Full (strict)"
2. Wait for Render SSL certificates to provision (5-10 minutes)
3. Verify custom domains are added in Render
4. Check Cloudflare Universal SSL is active

### Issue 4: Infinite Redirects

**Symptom**: Page keeps redirecting, "Too many redirects"

**Solutions**:
1. Change Cloudflare SSL/TLS to "Full (strict)"
2. Disable "Always Use HTTPS" temporarily
3. Check Render service isn't forcing HTTPS redirect
4. Clear browser cookies and cache

### Issue 5: 520/521/522 Errors

**Symptom**: Cloudflare 520, 521, or 522 errors

**Solutions**:
1. Check Render service is running (not sleeping)
2. Verify Render custom domain is configured
3. Check Render logs for errors
4. Wait for Render to wake up (free tier sleeps after inactivity)

### Issue 6: API Requests Timeout

**Symptom**: API calls take forever or timeout

**Solutions**:
1. Check Render backend service status
2. Verify database connection is working
3. Check Render logs for slow queries
4. Consider upgrading Render plan for better performance

---

## 📊 Expected DNS Records After Setup

```
Type    Name    Target                              Proxy   TTL
────────────────────────────────────────────────────────────────
CNAME   @       your-frontend-app.onrender.com      ✅      Auto
CNAME   api     your-backend-api.onrender.com       ✅      Auto
CNAME   www     your-frontend-app.onrender.com      ✅      Auto
```

---

## 🔐 Security Checklist

- [x] SSL/TLS Full (strict) mode enabled
- [x] Always Use HTTPS enabled
- [x] HSTS enabled with preload
- [x] Cloudflare proxy (orange cloud) enabled
- [x] WAF (Web Application Firewall) enabled
- [x] Bot Fight Mode enabled
- [x] Rate limiting configured
- [x] Security headers configured in backend
- [x] CORS restricted to your domain
- [x] Environment variables secured

---

## 🚀 Performance Checklist

- [x] Brotli compression enabled
- [x] Auto minify enabled (HTML, CSS, JS)
- [x] Browser cache configured
- [x] CDN (Cloudflare) proxying enabled
- [x] Early Hints enabled
- [x] Image optimization (consider Cloudflare Images)

---

## 📝 Environment Variables Summary

### Backend (Render)

```bash
# Database
DATABASE_URL=<your-postgres-url>

# URLs
FRONTEND_URL=https://advanciapayledger.com
BACKEND_URL=https://api.advanciapayledger.com

# JWT Secrets (from GitHub Secrets)
JWT_SECRET_ENCRYPTED=<encrypted>
JWT_ENCRYPTION_KEY=<key>
JWT_ENCRYPTION_IV=<iv>

# Twilio (if using SMS OTP)
TWILIO_ACCOUNT_SID=<your-sid>
TWILIO_AUTH_TOKEN=<your-token>
TWILIO_PHONE_NUMBER=<your-number>

# Redis (if using)
REDIS_URL=<your-redis-url>

# Node Environment
NODE_ENV=production
PORT=4000
```

### Frontend (Render)

```bash
# API URL
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com

# Frontend URL
NEXT_PUBLIC_FRONTEND_URL=https://advanciapayledger.com

# Node Environment
NODE_ENV=production
```

---

## 🎯 Quick Action Checklist

### In Cloudflare:
- [ ] Add CNAME for `@` → `your-frontend.onrender.com`
- [ ] Add CNAME for `api` → `your-backend.onrender.com`
- [ ] Add CNAME for `www` → `your-frontend.onrender.com`
- [ ] Set SSL/TLS to Full (strict)
- [ ] Enable Always Use HTTPS
- [ ] Enable HSTS
- [ ] Enable WAF
- [ ] Enable Bot Fight Mode
- [ ] Enable Auto Minify
- [ ] Enable Brotli

### In Render:
- [ ] Add custom domain `advanciapayledger.com` to frontend
- [ ] Add custom domain `www.advanciapayledger.com` to frontend
- [ ] Add custom domain `api.advanciapayledger.com` to backend
- [ ] Update `FRONTEND_URL` environment variable in backend
- [ ] Update `NEXT_PUBLIC_API_URL` in frontend
- [ ] Wait for services to redeploy
- [ ] Check SSL certificates are issued

### Testing:
- [ ] Visit https://advanciapayledger.com
- [ ] Test API: https://api.advanciapayledger.com/health
- [ ] Test login functionality
- [ ] Check browser console for errors
- [ ] Test from mobile device
- [ ] Verify SSL certificate is valid
- [ ] Test HTTPS redirect (try http://)

---

## 📞 Support Resources

**Cloudflare Documentation**:
- DNS Management: https://developers.cloudflare.com/dns/
- SSL/TLS: https://developers.cloudflare.com/ssl/
- Page Rules: https://developers.cloudflare.com/rules/

**Render Documentation**:
- Custom Domains: https://render.com/docs/custom-domains
- Environment Variables: https://render.com/docs/environment-variables
- SSL Certificates: https://render.com/docs/tls

**DNS Checkers**:
- https://dnschecker.org/
- https://www.whatsmydns.net/
- https://mxtoolbox.com/SuperTool.aspx

---

## 🎉 Success Criteria

Your setup is complete when:
1. ✅ https://advanciapayledger.com loads your frontend
2. ✅ https://api.advanciapayledger.com/health returns `{"status":"ok"}`
3. ✅ Login works without CORS errors
4. ✅ SSL certificate shows valid (green padlock)
5. ✅ http:// redirects to https://
6. ✅ www redirects to non-www (if configured)
7. ✅ All functionality works as expected

---

**Last Updated**: October 18, 2025  
**Platform**: Advancia Pay Ledger  
**Domain**: advanciapayledger.com  
**Status**: Ready for Configuration 🚀
