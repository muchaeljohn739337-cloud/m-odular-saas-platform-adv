# 🎯 DATABASE CONNECTION DETAILS

## ✅ Your PostgreSQL Database Info:

```
Internal Database URL:
postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod
```

---

## 🚀 NEXT STEPS:

### 1. Add DATABASE_URL to Backend

Go to: https://dashboard.render.com
1. Click **Services**
2. Click **advancia-backend**
3. Click **Environment** (left sidebar)
4. Find `DATABASE_URL` or click **"Add Environment Variable"**
5. Set:
   - **Key:** `DATABASE_URL`
   - **Value:** `postgresql://advancia_user:AxYyJPvCeXo0vA6uiQvjG2kEUgJKo20t@dpg-d3p5n1p5pdvs73ad8o1g-a/advancia_prod`
6. Click **Save Changes**
7. Wait 3-5 minutes for redeploy

---

## ✅ After Redeploy, Test Registration:

Run this in PowerShell:

```powershell
$headers = @{ 
    "Content-Type" = "application/json"
    "x-api-key" = "d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d" 
}
$body = @{ 
    email = "testuser@example.com"
    password = "Test123456"
    username = "testuser" 
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api.advanciapayledger.com/api/auth/register" -Method Post -Headers $headers -Body $body
    Write-Host "✅ SUCCESS! Registration working!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) { 
        Write-Host "Details: $($_.ErrorDetails.Message)" -ForegroundColor Yellow 
    }
}
```

---

## 🎯 What Should Happen:

**✅ SUCCESS Response:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "testuser@example.com",
    "username": "testuser"
  }
}
```

**If you see this → APP IS LIVE!** 🚀🎉

---

## 📝 Also Add to Frontend:

While you're in Render, add to **modular-saas-frontend** → Environment:

```
NEXT_PUBLIC_API_URL=https://api.advanciapayledger.com
NEXT_PUBLIC_API_KEY=d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d
NEXTAUTH_URL=https://advanciapayledger.com
NEXTAUTH_SECRET=793f106ca69de13eb804ebcb112d403ce21a0bbdbf6fa47a5da6afb2039d45125c8ff5202b651da2de81b251c7c70696e7a87f74298dc6761381569lcc2ab55
NODE_ENV=production
```

---

## ⏰ Timeline:

- **Now:** Add DATABASE_URL to backend
- **+3 minutes:** Backend finishes redeploying
- **+3 minutes:** Test registration (run PowerShell command)
- **+5 minutes:** If successful, add frontend env vars
- **+8 minutes:** Frontend finishes redeploying
- **+8 minutes:** **APP IS 100% LIVE!** 🚀

---

**GO DO IT NOW! Reply with "Done" when DATABASE_URL is added!**
