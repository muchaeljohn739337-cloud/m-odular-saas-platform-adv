# 🌐 Cloudflare DNS Configuration Template

## Copy-Paste Ready Configuration for Cloudflare

**Domain**: advanciapayledger.com  
**Date**: October 18, 2025

---

## 📋 Step 1: Get Your Render URLs

Before configuring DNS, get these URLs from your Render dashboard:

1. **Go to**: https://dashboard.render.com
2. **Find your services**:
   - Frontend service (Next.js) → Copy the `.onrender.com` URL
   - Backend service (Express API) → Copy the `.onrender.com` URL

Example URLs (yours will be different):
```
Frontend: advancia-pay-frontend-xyz123.onrender.com
Backend:  advancia-pay-backend-abc456.onrender.com
```

---

## 📋 Step 2: Add DNS Records in Cloudflare

### Login to Cloudflare:
**URL**: https://dash.cloudflare.com  
**Select Domain**: advanciapayledger.com  
**Go to**: DNS → Records

---

### ✅ Record 1: Root Domain (@)

**Purpose**: Main website (advanciapayledger.com)

```
Type:    CNAME
Name:    @
Target:  <YOUR-FRONTEND-URL>.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied (Orange Cloud ON)
```

**Example**:
```
Type:    CNAME
Name:    @
Target:  advancia-pay-frontend-xyz123.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied
```

---

### ✅ Record 2: API Subdomain

**Purpose**: Backend API (api.advanciapayledger.com)

```
Type:    CNAME
Name:    api
Target:  <YOUR-BACKEND-URL>.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied (Orange Cloud ON)
```

**Example**:
```
Type:    CNAME
Name:    api
Target:  advancia-pay-backend-abc456.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied
```

---

### ✅ Record 3: WWW Subdomain (Optional)

**Purpose**: WWW redirect (www.advanciapayledger.com → advanciapayledger.com)

```
Type:    CNAME
Name:    www
Target:  <YOUR-FRONTEND-URL>.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied (Orange Cloud ON)
```

**Example**:
```
Type:    CNAME
Name:    www
Target:  advancia-pay-frontend-xyz123.onrender.com
TTL:     Auto
Proxy:   ✅ Proxied
```

---

## 📋 Step 3: Configure SSL/TLS Settings

### Go to: SSL/TLS → Overview

**Select Mode**: Full (strict)

```
Encryption mode: Full (strict)
```

This ensures:
- ✅ HTTPS between Cloudflare and your origin
- ✅ Valid SSL certificate verification
- ✅ End-to-end encryption

---

### Go to: SSL/TLS → Edge Certificates

**Enable these settings**:

```
✅ Always Use HTTPS: ON
✅ Automatic HTTPS Rewrites: ON
✅ Minimum TLS Version: TLS 1.2
✅ Opportunistic Encryption: ON
✅ TLS 1.3: ON
```

**Optional (Recommended) - Enable HSTS**:
```
✅ HTTP Strict Transport Security (HSTS): Enable
   - Max Age: 6 months (15768000 seconds)
   - Include subdomains: ✅
   - Preload: ✅
   - No-Sniff Header: ✅
```

---

## 📋 Step 4: Configure Page Rules (Optional)

### Go to: Rules → Page Rules

### Rule 1: Force HTTPS
```
URL Pattern:  http://*advanciapayledger.com/*
Setting:      Always Use HTTPS
```

### Rule 2: WWW to Non-WWW Redirect
```
URL Pattern:  www.advanciapayledger.com/*
Setting:      Forwarding URL (301 - Permanent Redirect)
Destination:  https://advanciapayledger.com/$1
```

---

## 📋 Step 5: Configure Security (Optional but Recommended)

### Go to: Security → WAF

**Enable**:
```
✅ OWASP Core Ruleset
✅ Cloudflare Managed Ruleset
✅ Cloudflare Sensitive Data Detection
```

### Go to: Security → Bots

**Enable**:
```
✅ Bot Fight Mode (Free)
```

---

## 📋 Step 6: Configure Performance (Optional)

### Go to: Speed → Optimization

**Enable**:
```
✅ Auto Minify:
   ✅ JavaScript
   ✅ CSS
   ✅ HTML
✅ Brotli Compression
✅ Early Hints
```

### Go to: Caching → Configuration

**Set**:
```
Browser Cache TTL: 4 hours
✅ Always Online: ON
```

---

## ✅ Verification Checklist

After completing configuration, verify:

### DNS Verification:
```powershell
# Check DNS records
nslookup advanciapayledger.com
nslookup api.advanciapayledger.com
nslookup www.advanciapayledger.com

# All should return Cloudflare IPs (104.x.x.x or 172.x.x.x)
```

### SSL Verification:
```powershell
# Test SSL certificate
curl -I https://advanciapayledger.com
curl -I https://api.advanciapayledger.com

# Should return 200 OK with valid SSL
```

### Online Tools:
- DNS Checker: https://dnschecker.org/
- SSL Test: https://www.ssllabs.com/ssltest/
- HTTP Headers: https://securityheaders.com/

---

## 📊 Expected Final Configuration

### DNS Records Summary:
```
┌────────┬──────┬─────────────────────────────────────┬────────┐
│ Type   │ Name │ Target                              │ Proxy  │
├────────┼──────┼─────────────────────────────────────┼────────┤
│ CNAME  │ @    │ your-frontend.onrender.com          │ ✅ ON  │
│ CNAME  │ api  │ your-backend.onrender.com           │ ✅ ON  │
│ CNAME  │ www  │ your-frontend.onrender.com          │ ✅ ON  │
└────────┴──────┴─────────────────────────────────────┴────────┘
```

### SSL/TLS Settings:
```
✅ Mode: Full (strict)
✅ Always Use HTTPS: ON
✅ Automatic HTTPS Rewrites: ON
✅ HSTS: Enabled (optional)
✅ TLS 1.3: Enabled
```

### Security Settings:
```
✅ WAF: Enabled
✅ Bot Fight Mode: Enabled
✅ Rate Limiting: Enabled (in backend code)
```

### Performance Settings:
```
✅ Auto Minify: JavaScript, CSS, HTML
✅ Brotli Compression: Enabled
✅ Browser Cache: 4 hours
```

---

## 🎯 Success Criteria

Your configuration is complete when:

- ✅ DNS records resolve to Cloudflare IPs
- ✅ SSL certificate shows valid (green padlock)
- ✅ https://advanciapayledger.com loads your frontend
- ✅ https://api.advanciapayledger.com/health returns `{"status":"ok"}`
- ✅ http:// automatically redirects to https://
- ✅ www.advanciapayledger.com redirects to advanciapayledger.com
- ✅ No CORS errors in browser console
- ✅ All features work correctly

---

## ⏱️ Timeline

- **DNS Propagation**: 5-30 minutes (usually ~15 minutes)
- **SSL Certificate**: 5-10 minutes (automatic via Cloudflare)
- **Total Setup**: 10-15 minutes of work + 15-30 minutes propagation

---

## 🐛 Troubleshooting

### DNS Not Resolving?
```
✅ Wait 15-30 minutes for propagation
✅ Clear DNS cache: ipconfig /flushdns
✅ Check records are correct in Cloudflare
✅ Verify orange cloud (proxy) is enabled
```

### SSL Certificate Invalid?
```
✅ Check SSL mode is "Full (strict)"
✅ Wait 5-10 minutes for certificate provisioning
✅ Verify custom domains added in Render
✅ Check Cloudflare Universal SSL is active
```

### CORS Errors?
```
✅ Verify FRONTEND_URL in backend env vars
✅ Check Cloudflare proxy is enabled (orange cloud)
✅ Confirm backend code has multi-origin CORS
```

---

**Domain**: advanciapayledger.com  
**Configuration**: Complete Template  
**Ready to Apply**: Yes ✅  
**Estimated Time**: 10-15 minutes + propagation

---

## 📞 Support

**Cloudflare Support**: https://support.cloudflare.com/  
**Render Support**: https://render.com/docs/  
**Domain Setup Guide**: See `CLOUDFLARE_DOMAIN_SETUP.md`
