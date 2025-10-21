# Monitor Render Backend Deployment
# Checks health endpoint to see when new deployment is live

$apiUrl = "https://api.advanciapayledger.com"
$checkInterval = 10  # seconds
$maxChecks = 30      # 5 minutes max

Write-Host "🔄 Monitoring Backend Deployment on Render" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "Waiting for deployment to complete..." -ForegroundColor Yellow
Write-Host "This typically takes 2-3 minutes." -ForegroundColor Gray
Write-Host ""

$checkCount = 0
$deploymentComplete = $false

while ($checkCount -lt $maxChecks -and -not $deploymentComplete) {
    $checkCount++
    $elapsed = $checkCount * $checkInterval
    
    Write-Host "[$($checkCount)/$($maxChecks)] Checking health endpoint... " -NoNewline -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$apiUrl/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        
        if ($response.service -eq "advancia-backend" -and $response.version) {
            Write-Host "✅" -ForegroundColor Green
            Write-Host ""
            Write-Host "🎉 Deployment Complete!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Backend Info:" -ForegroundColor Cyan
            Write-Host "  Service: $($response.service)" -ForegroundColor Gray
            Write-Host "  Version: $($response.version)" -ForegroundColor Gray
            Write-Host "  Status: $($response.status)" -ForegroundColor Gray
            Write-Host "  Timestamp: $($response.timestamp)" -ForegroundColor Gray
            Write-Host ""
            $deploymentComplete = $true
        }
        else {
            Write-Host "⏳ (old version)" -ForegroundColor Yellow
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host "⚠️ HTTP $statusCode" -ForegroundColor Yellow
        }
        else {
            Write-Host "⏳" -ForegroundColor Yellow
        }
    }
    
    if (-not $deploymentComplete -and $checkCount -lt $maxChecks) {
        Start-Sleep -Seconds $checkInterval
    }
}

Write-Host ""

if ($deploymentComplete) {
    Write-Host "✅ Backend is ready for testing!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Run: .\test-production.ps1" -ForegroundColor Gray
    Write-Host "  2. Check Prisma Studio at http://localhost:5555" -ForegroundColor Gray
    Write-Host "  3. Test frontend at https://advanciapayledger.com" -ForegroundColor Gray
}
else {
    Write-Host "⏰ Deployment taking longer than expected" -ForegroundColor Yellow
    Write-Host "Check Render dashboard: https://dashboard.render.com" -ForegroundColor Cyan
    Write-Host "Service: advancia-backend" -ForegroundColor Gray
}

Write-Host ""
