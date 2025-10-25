# Start Development Servers
# Runs both backend and frontend for local testing

Write-Host "`n🚀 Starting Development Servers" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

$rootPath = "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform"

# Function to test if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient("127.0.0.1", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Check if ports are already in use
Write-Host "[1/4] Checking ports..." -ForegroundColor Yellow

$backendPort = 4000
$frontendPort = 3000

if (Test-Port $backendPort) {
    Write-Host "⚠️  Port $backendPort is already in use (Backend)" -ForegroundColor Yellow
    Write-Host "Kill existing process? (Y/N): " -NoNewline
    $kill = Read-Host
    if ($kill -eq "Y" -or $kill -eq "y") {
        npx kill-port $backendPort
        Start-Sleep -Seconds 2
        Write-Host "✅ Port $backendPort freed" -ForegroundColor Green
    }
}

if (Test-Port $frontendPort) {
    Write-Host "⚠️  Port $frontendPort is already in use (Frontend)" -ForegroundColor Yellow
    Write-Host "Kill existing process? (Y/N): " -NoNewline
    $kill = Read-Host
    if ($kill -eq "Y" -or $kill -eq "y") {
        npx kill-port $frontendPort
        Start-Sleep -Seconds 2
        Write-Host "✅ Port $frontendPort freed" -ForegroundColor Green
    }
}

# Start Backend
Write-Host "`n[2/4] Starting Backend Server (Port 4000)..." -ForegroundColor Yellow
Write-Host "Location: $rootPath\backend" -ForegroundColor Gray

$backendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\backend"
    npm run dev
}

Write-Host "✅ Backend starting (Job ID: $($backendJob.Id))" -ForegroundColor Green
Start-Sleep -Seconds 5

# Check if backend started
if (Test-Port $backendPort) {
    Write-Host "✅ Backend is running on http://localhost:4000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Backend may still be starting..." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "`n[3/4] Starting Frontend Server (Port 3000)..." -ForegroundColor Yellow
Write-Host "Location: $rootPath\frontend" -ForegroundColor Gray

$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\mucha.DESKTOP-H7T9NPM\-modular-saas-platform\frontend"
    npm run dev
}

Write-Host "✅ Frontend starting (Job ID: $($frontendJob.Id))" -ForegroundColor Green
Start-Sleep -Seconds 5

# Check if frontend started
if (Test-Port $frontendPort) {
    Write-Host "✅ Frontend is running on http://localhost:3000" -ForegroundColor Green
} else {
    Write-Host "⚠️  Frontend may still be starting..." -ForegroundColor Yellow
}

# Test endpoints
Write-Host "`n[4/4] Testing endpoints..." -ForegroundColor Yellow

Start-Sleep -Seconds 3

try {
    Write-Host "`nTesting Backend Health..." -ForegroundColor Cyan
    $backendHealth = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 5
    if ($backendHealth.StatusCode -eq 200) {
        Write-Host "✅ Backend Health: OK (HTTP $($backendHealth.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend Health: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

try {
    Write-Host "Testing Frontend..." -ForegroundColor Cyan
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($frontendTest.StatusCode -eq 200) {
        Write-Host "✅ Frontend: OK (HTTP $($frontendTest.StatusCode))" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend: Failed - $($_.Exception.Message)" -ForegroundColor Red
}

# Summary
Write-Host "`n" + ("="*50) -ForegroundColor Cyan
Write-Host "🎉 Development Servers Running!" -ForegroundColor Green
Write-Host ("="*50) -ForegroundColor Cyan

Write-Host "`n📊 Server Status:" -ForegroundColor Cyan
Write-Host "   Backend:  http://localhost:4000" -ForegroundColor White
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White

Write-Host "`n🧪 Test Endpoints:" -ForegroundColor Cyan
Write-Host "   Health:   http://localhost:4000/api/health" -ForegroundColor White
Write-Host "   Auth:     http://localhost:4000/api/auth/check" -ForegroundColor White
Write-Host "   Dashboard: http://localhost:3000/dashboard" -ForegroundColor White

Write-Host "`n📋 Job IDs:" -ForegroundColor Cyan
Write-Host "   Backend:  $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Frontend: $($frontendJob.Id)" -ForegroundColor Gray

Write-Host "`n🛑 To stop servers:" -ForegroundColor Yellow
Write-Host "   Stop-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "   Remove-Job $($backendJob.Id), $($frontendJob.Id)" -ForegroundColor Gray
Write-Host "   Or: npx kill-port 3000 4000" -ForegroundColor Gray

Write-Host "`n🌐 Open in browser:" -ForegroundColor Cyan
Write-Host "   Start-Process http://localhost:3000" -ForegroundColor Gray

Write-Host "`n💡 View server logs:" -ForegroundColor Cyan
Write-Host "   Receive-Job $($backendJob.Id)" -ForegroundColor Gray
Write-Host "   Receive-Job $($frontendJob.Id)" -ForegroundColor Gray

Write-Host "`n✨ Servers will keep running in background" -ForegroundColor Green
Write-Host "   To interact with them, use the commands above`n" -ForegroundColor Gray
