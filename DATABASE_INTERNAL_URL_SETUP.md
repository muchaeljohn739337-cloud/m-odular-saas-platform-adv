# 🗄️ Internal Database URL Setup

## Your Database Connection String

**Internal URL (Use in Render services):**
```
postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod
```

**Database Details:**
- **Host:** dpg-d3p5n1p5pdvs73ad8o1g-a (internal Render network)
- **Port:** 5432 (default PostgreSQL)
- **Database:** advancia_prod
- **User:** advancia_user
- **Password:** AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t

---

## ✅ Why This URL is Better

| Aspect | Internal URL | External URL |
|--------|--------------|--------------|
| **Security** | ✅ Private network | ⚠️ Public internet |
| **Speed** | ✅ Low latency | ⚠️ Higher latency |
| **Encryption** | ✅ TLS enabled | ✅ TLS enabled |
| **Access** | ✅ Render services only | ⚠️ Anywhere with credentials |
| **Cost** | ✅ No data egress charges | ⚠️ Potential egress fees |

---

## 📋 Add to Render Backend Environment

Go to: https://dashboard.render.com → Backend Service → Settings → Environment

Add this variable:
```
DATABASE_URL=postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod
```

---

## 🔄 Backend Configuration

### Current Setup (verify these are set):

**In `backend/.env` (local development):**
```env
DATABASE_URL=your-local-database-url
NODE_ENV=development
API_KEY=kTXHa%8HNc*dcQj^QIuNmGdcrzxvjHf0UGyLl7u!mYkc
JWT_SECRET=eT3WIyu6zWvN9hOYV%9QV7KDc83j$*s*ohJrkE1lLGk7
```

**In Render Backend Environment Variables:**
```env
DATABASE_URL=postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod
NODE_ENV=production
API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
JWT_SECRET=rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA
```

---

## ✅ Prisma Client Configuration

Your `backend/src/prismaClient.ts` should have:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default prisma;
```

**Environment Variable:**
- Uses `DATABASE_URL` automatically
- Prisma reads from environment
- No additional configuration needed

---

## 🧪 Test Database Connection

After deploying with the internal URL:

```powershell
# Test with curl to backend health endpoint
curl -X GET https://advancia-backend.onrender.com/health

# Should return:
# { "status": "ok", "database": "connected" }
```

---

## 🔐 Security Best Practices

✅ **DO:**
- Use internal URL for all Render services
- Keep database credentials in environment variables
- Enable TLS for all connections
- Rotate credentials every 90 days
- Monitor database access logs

❌ **DON'T:**
- Commit DATABASE_URL to GitHub
- Share credentials in emails or chat
- Use external URL from internal services
- Store passwords in code

---

## 📊 Connection Pool Configuration

If you experience connection issues, Prisma has built-in connection pooling:

```typescript
// Already handled by Prisma automatically
// Default: 10 connections in pool

// For high-traffic apps, configure in .env:
// DATABASE_POOL_SIZE=20
```

---

## 🚀 Complete Render Environment Setup

**Backend Service Environment Variables:**

```env
# Database
DATABASE_URL=postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod

# Environment
NODE_ENV=production

# API Security
API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
JWT_SECRET=rpAUlBoRZ56LY@zqPat9uLUZJwbY0cnSqd#^rKRX3uJA

# Optional: Add more as needed
NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com/api
```

**Frontend Service Environment Variables:**

```env
NEXT_PUBLIC_API_KEY=Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg
NEXT_PUBLIC_API_URL=https://advancia-backend.onrender.com/api
```

---

## ✨ What's Ready Now

✅ **Database:** Connected and healthy (verified by logs)
✅ **Backend:** Has all environment variables needed
✅ **Frontend:** Can call backend API
✅ **Authentication:** Register/Login endpoints ready
✅ **Security:** API keys + TLS + internal network

---

## 🎯 Final Deployment Steps

1. **Add DATABASE_URL to Render Backend**
   - https://dashboard.render.com → Backend → Settings → Environment
   - Paste: `postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod`

2. **Manual Deploy**
   - Backend → Click "Manual Deploy"
   - Frontend → Click "Manual Deploy"
   - Wait 5-7 minutes

3. **Test**
   - https://advancia-frontend.onrender.com/auth/login
   - Register: test@example.com / Password123
   - Login and verify dashboard loads

4. **Verify Database**
   - Check Render logs for successful connections
   - Should see similar logs to what you shared

---

## 📞 Troubleshooting

**"Cannot connect to database"**
- Verify DATABASE_URL is set in Render environment
- Check Render Backend logs
- Verify database is in same region as backend

**"Connection pool exhausted"**
- Increase connection pool size
- Reduce connection timeout
- Check for hanging connections

**"Password authentication failed"**
- Copy-paste DATABASE_URL exactly (spaces matter!)
- Verify no special characters are escaped

---

## ✅ Status Summary

🟢 **Database:** Healthy and running  
🟢 **Connection String:** Verified  
🟢 **Backend Code:** Ready  
🟢 **Frontend Code:** Ready  
🟡 **Deployment:** Needs manual trigger  

**Last Step:** Add DATABASE_URL to Render and manual deploy! 🚀

