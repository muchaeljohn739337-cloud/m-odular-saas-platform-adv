# Quick deployment verification script
Write-Host "`n=== Verifying Deployment ===" -ForegroundColor Cyan

Write-Host "`nChecking frontend (https://advanciapayledger.com)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "https://advanciapayledger.com" -Method Head -UseBasicParsing -TimeoutSec 30
    Write-Host "✅ Frontend: $($frontend.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nChecking backend health (https://api.advanciapayledger.com/health)..." -ForegroundColor Yellow
try {
    $backend = Invoke-RestMethod -Uri "https://api.advanciapayledger.com/health" -TimeoutSec 30
    Write-Host "✅ Backend health: OK" -ForegroundColor Green
    $backend | ConvertTo-Json -Depth 3 | Write-Host
} catch {
    Write-Host "❌ Backend health failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Verification Complete ===" -ForegroundColor Cyan
