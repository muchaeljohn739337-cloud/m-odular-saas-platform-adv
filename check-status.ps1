# 🚀 Server Status Check

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   ADVANCIA PAY LEDGER - SERVER STATUS" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Check Backend (Port 4000)
Write-Host "🔍 Checking Backend (Port 4000)..." -ForegroundColor Yellow
try {
    $backend = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 3
    $backendData = $backend.Content | ConvertFrom-Json
    Write-Host "   ✅ Backend: RUNNING" -ForegroundColor Green
    Write-Host "   Status: $($backendData.status)" -ForegroundColor Gray
    Write-Host "   Time: $($backendData.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Backend: NOT RESPONDING" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Check Frontend (Port 3000)
Write-Host "🔍 Checking Frontend (Port 3000)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3 -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "   ✅ Frontend: RUNNING" -ForegroundColor Green
    Write-Host "   Status Code: $($frontend.StatusCode)" -ForegroundColor Gray
} catch {
    if ($_.Exception.Response.StatusCode -eq 307) {
        Write-Host "   ✅ Frontend: RUNNING (redirecting)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Frontend: NOT RESPONDING" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Check Database
Write-Host "🔍 Checking Database (PostgreSQL)..." -ForegroundColor Yellow
try {
    $db = docker exec saas-fullstack-db-1 psql -U postgres -d saasdb -c "SELECT 1;" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Database: CONNECTED" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Database: CONNECTION FAILED" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Database: NOT ACCESSIBLE" -ForegroundColor Red
}

Write-Host ""

# Check Redis
Write-Host "🔍 Checking Redis..." -ForegroundColor Yellow
try {
    $redis = docker exec saas-fullstack-redis-1 redis-cli ping 2>&1
    if ($redis -match "PONG") {
        Write-Host "   ✅ Redis: RUNNING" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Redis: NOT RESPONDING" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Redis: NOT ACCESSIBLE" -ForegroundColor Red
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   ACCESS URLs:" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Health:   http://localhost:4000/health" -ForegroundColor White
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
