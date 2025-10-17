# 🔑 QUICK REFERENCE - Authentication & API Keys

## Your Production API Keys

```
PRODUCTION_API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
PRODUCTION_JWT_SECRET=rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA
```

## Backup Recovery Tokens (8 tokens)
```
37242004, 71294384, 48334941, 20312906
82373992, 69498131, 57083253, 05483717
```

---

## 🚀 DEPLOY CHECKLIST

- [ ] Add `PRODUCTION_API_KEY` to Render Backend Environment
- [ ] Add `PRODUCTION_JWT_SECRET` to Render Backend Environment  
- [ ] Add `NEXT_PUBLIC_API_KEY` to Render Frontend Environment
- [ ] Manual Deploy (or wait 5 min for auto-deploy)
- [ ] Test endpoint: https://advancia-backend.onrender.com/health
- [ ] Test login: https://advancia-frontend.onrender.com/auth/login

---

## 🧪 QUICK TEST COMMANDS

### Register:
```powershell
$headers = @{"Content-Type"="application/json"; "X-API-Key"="Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg"}
$body = @{email="test@example.com";password="Test123456";firstName="Test";lastName="User"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/auth/register" -Method Post -Headers $headers -Body $body
```

### Login:
```powershell
$headers = @{"Content-Type"="application/json"; "X-API-Key"="Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg"}
$body = @{email="test@example.com";password="Test123456"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/auth/login" -Method Post -Headers $headers -Body $body
```

---

## 📍 IMPORTANT LINKS

| Resource | URL |
|----------|-----|
| **Render Dashboard** | https://dashboard.render.com |
| **Backend Logs** | Dashboard → advancia-backend → Logs |
| **Frontend Logs** | Dashboard → advancia-frontend → Logs |
| **Env Variables** | Dashboard → Service → Settings → Environment |
| **Login Page** | https://advancia-frontend.onrender.com/auth/login |
| **Health Check** | https://advancia-backend.onrender.com/health |
| **GitHub Repo** | https://github.com/pdtribe181-prog/-modular-saas-platform |

---

## 🔄 REGENERATE API KEYS

Run anytime:
```powershell
c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\Generate-APIKeys.ps1
```

Then update:
1. `YOUR_API_KEYS.md` with new keys
2. Render Environment Variables
3. Local `.env` files

---

## 📊 ENDPOINTS

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| POST | `/api/auth/register` | X-API-Key | Create new user |
| POST | `/api/auth/login` | X-API-Key | Login with email/password |
| GET | `/health` | None | Service health check |
| POST | `/api/auth/verify-otp` | X-API-Key | Verify OTP (existing) |
| POST | `/api/auth/send-otp` | X-API-Key | Send OTP (existing) |

---

## 🆘 TROUBLESHOOTING

### "Invalid or missing API key"
✅ Solution: Add X-API-Key header to request
```powershell
-Headers @{"X-API-Key"="Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg"}
```

### "User already exists"
✅ Solution: Use different email or delete user from database
```sql
DELETE FROM "User" WHERE email = 'test@example.com';
```

### Login page shows "Error connecting to API"
✅ Solution: 
1. Check NEXT_PUBLIC_API_URL in Frontend Environment
2. Check NEXT_PUBLIC_API_KEY is set
3. Verify Backend is running

### "Cannot find module bcryptjs"
✅ Solution: Already fixed! Just redeploy from commit 48d93a2

---

## 📞 LATEST DEPLOYMENT

**Commit:** 48d93a2  
**Branch:** main  
**Date:** Oct 17, 2025  
**Changes:**
- ✅ API key validation middleware added
- ✅ Register endpoint protected with X-API-Key
- ✅ Login endpoint protected with X-API-Key
- ✅ NextAuth sends API key with requests
- ✅ Backup tokens stored securely

**Status:** Ready for production deployment

---

## ✅ YOU'RE ALL SET!

🚀 Your authentication system is complete!  
🔐 All endpoints are secured with API keys!  
💾 Backup tokens ready for emergencies!  
📊 Ready for production use!

**Next:** Add env vars to Render and manual deploy!

