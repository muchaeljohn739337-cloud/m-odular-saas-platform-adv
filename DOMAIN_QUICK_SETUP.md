# 🚀 Quick Domain Setup - advanciapayledger.com

## ⚡ Fast Track (5 Minutes)

### 1️⃣ Cloudflare DNS (2 min)
```
Login: https://dash.cloudflare.com

Add DNS Records:
┌────────┬──────┬─────────────────────────────────┬────────┐
│ Type   │ Name │ Target                          │ Proxy  │
├────────┼──────┼─────────────────────────────────┼────────┤
│ CNAME  │ @    │ your-frontend.onrender.com      │ ✅ ON  │
│ CNAME  │ api  │ your-backend.onrender.com       │ ✅ ON  │
│ CNAME  │ www  │ your-frontend.onrender.com      │ ✅ ON  │
└────────┴──────┴─────────────────────────────────┴────────┘
```

### 2️⃣ Cloudflare SSL (1 min)
```
SSL/TLS → Overview:
  → Select: Full (strict) ✅

SSL/TLS → Edge Certificates:
  → Always Use HTTPS: ON ✅
  → Automatic HTTPS Rewrites: ON ✅
```

### 3️⃣ Render Custom Domains (2 min)
```
Frontend Service → Settings → Custom Domains:
  → Add: advanciapayledger.com
  → Add: www.advanciapayledger.com

Backend Service → Settings → Custom Domains:
  → Add: api.advanciapayledger.com
```

### 4️⃣ Render Environment Variables (1 min)
```
Backend Service → Environment:
  FRONTEND_URL=https://advanciapayledger.com

Frontend Service → Environment:
  NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
```

---

## ✅ Verification (1 min)

```bash
# Test DNS
nslookup advanciapayledger.com
nslookup api.advanciapayledger.com

# Test SSL
curl -I https://advanciapayledger.com
curl -I https://api.advanciapayledger.com/health

# Expected: 200 OK responses
```

---

## 🎯 URLs After Setup

| Service  | URL                                    |
|----------|----------------------------------------|
| Frontend | https://advanciapayledger.com          |
| API      | https://api.advanciapayledger.com      |
| Health   | https://api.advanciapayledger.com/health |

---

## 🐛 Quick Fixes

**DNS Not Working?**
```powershell
ipconfig /flushdns
# Wait 5-15 minutes for propagation
```

**CORS Errors?**
```
Check: Backend FRONTEND_URL = https://advanciapayledger.com
Check: Cloudflare Proxy = ON (orange cloud)
```

**SSL Invalid?**
```
Check: Cloudflare SSL = Full (strict)
Check: Render custom domains added
Wait: 5-10 minutes for SSL provisioning
```

---

## 📋 Complete Guide
See: `CLOUDFLARE_DOMAIN_SETUP.md` for detailed instructions

---

**Domain**: advanciapayledger.com  
**Total Setup Time**: ~10 minutes  
**DNS Propagation**: 5-30 minutes
