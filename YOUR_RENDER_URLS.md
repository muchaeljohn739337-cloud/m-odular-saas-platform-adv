# 🔗 YOUR RENDER URLS

**Service Names from render.yaml**:
- Backend: `advancia-backend`
- Frontend: `advancia-frontend`
- Database: `advancia-db`

---

## 🌐 ACTUAL URLS

### Backend API:
```
https://advancia-backend.onrender.com
```

### Frontend App:
```
https://advancia-frontend.onrender.com
```

---

## 🧪 TEST YOUR DEPLOYMENT

### 1. Health Check (Backend):
```bash
curl https://advancia-backend.onrender.com/health
```

**Expected Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-10-18T...",
  "uptime": 123.45
}
```

### 2. ETH Gateway Test:
```bash
curl https://advancia-backend.onrender.com/api/eth/gas-price
```

**Expected Response**:
```json
{
  "gasPrice": "12345678900"
}
```

### 3. Frontend Test:
```
Visit: https://advancia-frontend.onrender.com
```

**Expected**:
- Landing/login page loads
- Can register new account
- Dashboard accessible after login

---

## 🔍 RENDER DASHBOARD LINKS

### Backend Service:
```
https://dashboard.render.com/web/advancia-backend
```

### Frontend Service:
```
https://dashboard.render.com/web/advancia-frontend
```

### Database:
```
https://dashboard.render.com/d/advancia-db
```

---

## 📊 CHECK DEPLOYMENT STATUS

### PowerShell Commands:
```powershell
# Test health endpoint
curl https://advancia-backend.onrender.com/health

# Open frontend in browser
start https://advancia-frontend.onrender.com

# Open Render dashboard
start https://dashboard.render.com
```

---

## ⚠️ IF URLS DON'T WORK YET

### Your services might still be deploying:

1. **Check Status** in Render Dashboard:
   - Go to: https://dashboard.render.com
   - Look for your services
   - Status should show "Live" (green)

2. **Wait for Build** (~10-15 min):
   - Backend: Building from commit 33aa4fa
   - Frontend: Building from commit 33aa4fa
   - First deploy takes longer (cold start)

3. **Check Build Logs**:
   - Click on service name
   - Go to "Events" tab
   - View latest deployment logs

---

## 🎯 QUICK TEST SCRIPT

Save this as `test-deployment.ps1`:

```powershell
Write-Host "🧪 Testing Advancia Deployment..." -ForegroundColor Cyan

Write-Host "`n1️⃣ Testing Backend Health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/health"
    Write-Host "  ✅ Backend is LIVE!" -ForegroundColor Green
    Write-Host "  Status: $($health.status)" -ForegroundColor White
} catch {
    Write-Host "  ⏳ Backend not ready yet (still deploying)" -ForegroundColor Yellow
}

Write-Host "`n2️⃣ Testing ETH Gateway..." -ForegroundColor Yellow
try {
    $gas = Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/eth/gas-price"
    Write-Host "  ✅ ETH Gateway is working!" -ForegroundColor Green
    Write-Host "  Gas Price: $($gas.gasPrice)" -ForegroundColor White
} catch {
    Write-Host "  ⏳ ETH Gateway not ready yet" -ForegroundColor Yellow
}

Write-Host "`n3️⃣ Opening Frontend..." -ForegroundColor Yellow
start https://advancia-frontend.onrender.com

Write-Host "`n✅ Test Complete!" -ForegroundColor Green
Write-Host "If services aren't ready, wait 10-15 minutes for first deploy" -ForegroundColor Cyan
```

---

## 📝 YOUR RENDER CONFIGURATION

From `render.yaml`:

### Backend (`advancia-backend`):
- **Build**: `cd backend && npm ci && npm run build`
- **Start**: `cd backend && npm start`
- **Port**: 4000
- **Health Check**: `/health`
- **Database**: PostgreSQL (advancia-db)

### Frontend (`advancia-frontend`):
- **Build**: `cd frontend && npm ci && npm run build`
- **Start**: `cd frontend && npm start`
- **API URL**: `https://advancia-backend.onrender.com/api`

---

## 🚀 WHAT TO DO NOW

### Immediate:
```powershell
# 1. Test health endpoint
curl https://advancia-backend.onrender.com/health

# 2. Open frontend
start https://advancia-frontend.onrender.com

# 3. Open Render dashboard to monitor
start https://dashboard.render.com
```

### If Services Are Still Deploying:
- ✅ Normal for first deploy (10-15 min)
- ✅ Watch build logs in Render dashboard
- ✅ Services will show "Building..." status
- ✅ Will turn green when live

---

## 🎉 SUMMARY

**Your URLs**:
- 🔗 Backend: `https://advancia-backend.onrender.com`
- 🔗 Frontend: `https://advancia-frontend.onrender.com`
- 🔗 Dashboard: `https://dashboard.render.com`

**Test with**:
```bash
curl https://advancia-backend.onrender.com/health
```

**Monitor at**:
```
https://dashboard.render.com
```

---

**🎊 Your services are deploying to these URLs! 🎊**
