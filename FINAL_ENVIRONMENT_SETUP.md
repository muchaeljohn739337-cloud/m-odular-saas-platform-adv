# 🎯 FINAL FIX - Copy/Paste These Exact Values

## ✅ I've Updated render.yaml

The configuration now expects you to manually add these environment variables in Render Dashboard.

---

## 📋 RENDER DASHBOARD - BACKEND ENVIRONMENT VARIABLES

**Go to:** https://dashboard.render.com → **advancia-backend** → **Environment**

**Add these 3 variables (copy/paste exactly):**

### 1. DATABASE_URL
```
Key: DATABASE_URL
Value: [YOU MUST GET THIS FROM YOUR POSTGRESQL DATABASE]
```

**How to get it:**
1. In Render Dashboard, click "Databases" (left sidebar)
2. Click on your PostgreSQL database
3. Copy the "Internal Database URL"
4. Paste it here

**It should look like:**
```
postgresql://username:long_password@dpg-xxxxx-a.oregon-postgres.render.com/database_name
```

### 2. API_KEY
```
Key: API_KEY
Value: d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d
```

### 3. JWT_SECRET
```
Key: JWT_SECRET
Value: 793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55
```

---

## 📋 RENDER DASHBOARD - FRONTEND ENVIRONMENT VARIABLES

**Go to:** https://dashboard.render.com → **modular-saas-frontend** → **Environment**

**Add these 3 variables:**

### 1. NEXT_PUBLIC_API_URL
```
Key: NEXT_PUBLIC_API_URL
Value: https://api.advanciapayledger.com
```

### 2. NEXT_PUBLIC_API_KEY
```
Key: NEXT_PUBLIC_API_KEY
Value: d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d
```

### 3. NEXTAUTH_SECRET
```
Key: NEXTAUTH_SECRET
Value: 793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55
```

### 4. NEXTAUTH_URL
```
Key: NEXTAUTH_URL
Value: https://advanciapayledger.com
```

### 5. NODE_ENV
```
Key: NODE_ENV
Value: production
```

---

## 🚀 AFTER ADDING ALL VARIABLES:

1. **Push the updated render.yaml:**
   ```bash
   git add render.yaml
   git commit -m "Update render.yaml for manual environment variables"
   git push
   ```

2. **Wait for both services to redeploy** (3-5 minutes each)

3. **Test registration:** https://advanciapayledger.com/auth/register

---

## ❓ DON'T HAVE A POSTGRESQL DATABASE?

**Create one now:**

1. In Render Dashboard, click **"New +"** (top right)
2. Select **"PostgreSQL"**
3. Fill in:
   - **Name:** advancia-db
   - **Database:** advancia_prod
   - **User:** advancia_user  
   - **Region:** Oregon (US West) or closest to you
   - **PostgreSQL Version:** 16
   - **Plan:** Free
4. Click **"Create Database"**
5. Wait 2-3 minutes for provisioning
6. Then copy the "Internal Database URL" and add it as DATABASE_URL above

---

## 📝 CHECKLIST:

**Backend Variables:**
- [ ] DATABASE_URL (from your PostgreSQL database)
- [ ] API_KEY
- [ ] JWT_SECRET
- [ ] FRONTEND_URL (should already be there)
- [ ] NODE_ENV (should already be there)

**Frontend Variables:**
- [ ] NEXT_PUBLIC_API_URL
- [ ] NEXT_PUBLIC_API_KEY
- [ ] NEXTAUTH_SECRET
- [ ] NEXTAUTH_URL
- [ ] NODE_ENV

**Code:**
- [ ] render.yaml committed and pushed

**Deploy:**
- [ ] Both services show "Deploy live" (green)

**Test:**
- [ ] Registration works at advanciapayledger.com/auth/register

---

## 🆘 STILL NOT WORKING?

Run this test command to see the exact error:

```powershell
$headers = @{ "Content-Type" = "application/json"; "x-api-key" = "d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d" }
$body = @{ email = "test$(Get-Random)@example.com"; password = "Test123456"; username = "test$(Get-Random)" } | ConvertTo-Json
try {
    Invoke-RestMethod -Uri "https://api.advanciapayledger.com/api/auth/register" -Method Post -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow
}
```

**Send me the error message and I'll debug it!**

