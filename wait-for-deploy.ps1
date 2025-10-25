# Monitor Render Deployment
# Waits for build to complete and tests health endpoint

$backendUrl = "https://advancia-backend-upnf.onrender.com"
$maxAttempts = 20
$intervalSeconds = 15

Write-Host "`n🔄 Monitoring Render Deployment" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "Backend URL: $backendUrl" -ForegroundColor Gray
Write-Host "Waiting for build to complete (~3-5 minutes)..." -ForegroundColor Yellow
Write-Host ""

# Wait initial period for build to start
Write-Host "Waiting 60 seconds for build to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

$deployed = $false
for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "[$i/$maxAttempts] Testing /health..." -NoNewline
    
    try {
        $response = Invoke-RestMethod -Uri "$backendUrl/health" -Method GET -TimeoutSec 8 -ErrorAction Stop
        
        if ($response.status -eq "healthy") {
            Write-Host " ✅ DEPLOYED!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Backend Response:" -ForegroundColor Cyan
            $response | Format-List
            $deployed = $true
            break
        }
        else {
            Write-Host " ⚠️ Unexpected response" -ForegroundColor Yellow
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode) {
            Write-Host " ⏳ HTTP $statusCode" -ForegroundColor Yellow
        }
        else {
            Write-Host " ⏳ (building...)" -ForegroundColor Yellow
        }
    }
    
    if ($i -lt $maxAttempts) {
        Start-Sleep -Seconds $intervalSeconds
    }
}

Write-Host ""
if ($deployed) {
    Write-Host "✅ Backend is LIVE!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Test login:" -ForegroundColor Gray
    Write-Host "     `$h = @{`"x-api-key`"=`"d3b0f811bf79f5f9dde7525ab6799e3b2fe175decf5eecc969b250cb70a4440d`"}" -ForegroundColor DarkGray
    Write-Host "     `$b = '{`"username`":`"admin`",`"password`":`"AdminPassword123!`"}'" -ForegroundColor DarkGray
    Write-Host "     Invoke-RestMethod `"$backendUrl/api/auth/login`" -Method POST -Body `$b -ContentType `"application/json`" -Headers `$h" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  2. Open Prisma Studio to verify users:" -ForegroundColor Gray
    Write-Host "     http://localhost:5555" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "  3. Run full test suite:" -ForegroundColor Gray
    Write-Host "     .\test-production.ps1" -ForegroundColor DarkGray
}
else {
    Write-Host "⏰ Deployment taking longer than expected" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Check Render logs:" -ForegroundColor Cyan
    Write-Host "  https://dashboard.render.com → advancia-backend-upnf → Logs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Or try manual health check:" -ForegroundColor Cyan
    Write-Host "  Invoke-RestMethod '$backendUrl/health'" -ForegroundColor Gray
}

Write-Host ""
