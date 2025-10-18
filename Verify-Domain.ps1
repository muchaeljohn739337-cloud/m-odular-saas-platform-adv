# 🔍 Domain Verification Script
# Automated testing for advanciapayledger.com setup

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🌐 Domain Verification Test Suite" -ForegroundColor Cyan
Write-Host "Domain: advanciapayledger.com" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results = @()
$passCount = 0
$failCount = 0

# Test 1: DNS Resolution - Main Domain
Write-Host "Test 1: DNS Resolution (advanciapayledger.com)..." -ForegroundColor Yellow
try {
    $dns = Resolve-DnsName -Name "advanciapayledger.com" -Type A -ErrorAction Stop
    if ($dns) {
        Write-Host "✅ PASS: DNS resolves to $($dns[0].IPAddress)" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="DNS Main"; Status="✅ PASS"; Detail=$dns[0].IPAddress}
        $passCount++
    }
} catch {
    Write-Host "❌ FAIL: DNS resolution failed" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="DNS Main"; Status="❌ FAIL"; Detail="No resolution"}
    $failCount++
}

# Test 2: DNS Resolution - API Subdomain
Write-Host "`nTest 2: DNS Resolution (api.advanciapayledger.com)..." -ForegroundColor Yellow
try {
    $dnsApi = Resolve-DnsName -Name "api.advanciapayledger.com" -Type A -ErrorAction Stop
    if ($dnsApi) {
        Write-Host "✅ PASS: API DNS resolves to $($dnsApi[0].IPAddress)" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="DNS API"; Status="✅ PASS"; Detail=$dnsApi[0].IPAddress}
        $passCount++
    }
} catch {
    Write-Host "❌ FAIL: API DNS resolution failed" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="DNS API"; Status="❌ FAIL"; Detail="No resolution"}
    $failCount++
}

# Test 3: Frontend HTTPS
Write-Host "`nTest 3: Frontend HTTPS (https://advanciapayledger.com)..." -ForegroundColor Yellow
try {
    $frontend = Invoke-WebRequest -Uri "https://advanciapayledger.com" -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($frontend.StatusCode -eq 200) {
        Write-Host "✅ PASS: Frontend returns 200 OK" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="Frontend HTTPS"; Status="✅ PASS"; Detail="200 OK"}
        $passCount++
    }
} catch {
    Write-Host "❌ FAIL: Frontend not accessible - $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Frontend HTTPS"; Status="❌ FAIL"; Detail=$_.Exception.Message}
    $failCount++
}

# Test 4: API Health Check
Write-Host "`nTest 4: API Health Check (https://api.advanciapayledger.com/health)..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://api.advanciapayledger.com/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    if ($health.status -eq "healthy") {
        Write-Host "✅ PASS: API health check returned: $($health.status)" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="API Health"; Status="✅ PASS"; Detail=$health.status}
        $passCount++
    } else {
        Write-Host "⚠️  WARN: API responded but status is: $($health.status)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{Test="API Health"; Status="⚠️  WARN"; Detail=$health.status}
    }
} catch {
    Write-Host "❌ FAIL: API health check failed - $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="API Health"; Status="❌ FAIL"; Detail=$_.Exception.Message}
    $failCount++
}

# Test 5: SSL Certificate - Frontend
Write-Host "`nTest 5: SSL Certificate Validation (Frontend)..." -ForegroundColor Yellow
try {
    $req = [System.Net.HttpWebRequest]::Create("https://advanciapayledger.com")
    $req.Method = "HEAD"
    $req.Timeout = 10000
    $response = $req.GetResponse()
    Write-Host "✅ PASS: SSL certificate is valid" -ForegroundColor Green
    $results += [PSCustomObject]@{Test="SSL Frontend"; Status="✅ PASS"; Detail="Valid certificate"}
    $response.Close()
    $passCount++
} catch {
    Write-Host "❌ FAIL: SSL validation failed - $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="SSL Frontend"; Status="❌ FAIL"; Detail="Invalid certificate"}
    $failCount++
}

# Test 6: SSL Certificate - API
Write-Host "`nTest 6: SSL Certificate Validation (API)..." -ForegroundColor Yellow
try {
    $reqApi = [System.Net.HttpWebRequest]::Create("https://api.advanciapayledger.com/health")
    $reqApi.Method = "HEAD"
    $reqApi.Timeout = 10000
    $responseApi = $reqApi.GetResponse()
    Write-Host "✅ PASS: API SSL certificate is valid" -ForegroundColor Green
    $results += [PSCustomObject]@{Test="SSL API"; Status="✅ PASS"; Detail="Valid certificate"}
    $responseApi.Close()
    $passCount++
} catch {
    Write-Host "❌ FAIL: API SSL validation failed - $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="SSL API"; Status="❌ FAIL"; Detail="Invalid certificate"}
    $failCount++
}

# Test 7: Security Headers
Write-Host "`nTest 7: Security Headers Check..." -ForegroundColor Yellow
try {
    $headers = Invoke-WebRequest -Uri "https://api.advanciapayledger.com/health" -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $securityHeaders = @(
        "x-content-type-options",
        "x-frame-options",
        "x-xss-protection"
    )
    $foundHeaders = 0
    foreach ($header in $securityHeaders) {
        if ($headers.Headers[$header]) {
            $foundHeaders++
        }
    }
    if ($foundHeaders -ge 2) {
        Write-Host "✅ PASS: Security headers present ($foundHeaders/3)" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="Security Headers"; Status="✅ PASS"; Detail="$foundHeaders/3 headers"}
        $passCount++
    } else {
        Write-Host "⚠️  WARN: Only $foundHeaders/3 security headers found" -ForegroundColor Yellow
        $results += [PSCustomObject]@{Test="Security Headers"; Status="⚠️  WARN"; Detail="$foundHeaders/3 headers"}
    }
} catch {
    Write-Host "❌ FAIL: Could not check headers - $($_.Exception.Message)" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Security Headers"; Status="❌ FAIL"; Detail=$_.Exception.Message}
    $failCount++
}

# Test 8: Response Time - Frontend
Write-Host "`nTest 8: Response Time Test (Frontend)..." -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-WebRequest -Uri "https://advanciapayledger.com" -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    if ($responseTime -lt 2000) {
        Write-Host "✅ PASS: Response time is ${responseTime}ms (< 2000ms)" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="Response Time Frontend"; Status="✅ PASS"; Detail="${responseTime}ms"}
        $passCount++
    } else {
        Write-Host "⚠️  WARN: Response time is ${responseTime}ms (slow)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{Test="Response Time Frontend"; Status="⚠️  WARN"; Detail="${responseTime}ms"}
    }
} catch {
    Write-Host "❌ FAIL: Could not measure response time" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Response Time Frontend"; Status="❌ FAIL"; Detail="Timeout"}
    $failCount++
}

# Test 9: Response Time - API
Write-Host "`nTest 9: Response Time Test (API)..." -ForegroundColor Yellow
try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-RestMethod -Uri "https://api.advanciapayledger.com/health" -Method Get -TimeoutSec 10 -ErrorAction Stop
    $stopwatch.Stop()
    $responseTimeApi = $stopwatch.ElapsedMilliseconds
    if ($responseTimeApi -lt 1000) {
        Write-Host "✅ PASS: API response time is ${responseTimeApi}ms (< 1000ms)" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="Response Time API"; Status="✅ PASS"; Detail="${responseTimeApi}ms"}
        $passCount++
    } else {
        Write-Host "⚠️  WARN: API response time is ${responseTimeApi}ms (slow)" -ForegroundColor Yellow
        $results += [PSCustomObject]@{Test="Response Time API"; Status="⚠️  WARN"; Detail="${responseTimeApi}ms"}
    }
} catch {
    Write-Host "❌ FAIL: Could not measure API response time" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Response Time API"; Status="❌ FAIL"; Detail="Timeout"}
    $failCount++
}

# Test 10: Cloudflare Detection
Write-Host "`nTest 10: Cloudflare CDN Detection..." -ForegroundColor Yellow
try {
    $headers = Invoke-WebRequest -Uri "https://advanciapayledger.com" -Method Head -UseBasicParsing -TimeoutSec 10 -ErrorAction Stop
    if ($headers.Headers["Server"] -contains "cloudflare" -or $headers.Headers["CF-RAY"]) {
        Write-Host "✅ PASS: Cloudflare CDN is active" -ForegroundColor Green
        $results += [PSCustomObject]@{Test="Cloudflare CDN"; Status="✅ PASS"; Detail="Active"}
        $passCount++
    } else {
        Write-Host "⚠️  WARN: Cloudflare headers not detected" -ForegroundColor Yellow
        $results += [PSCustomObject]@{Test="Cloudflare CDN"; Status="⚠️  WARN"; Detail="Not detected"}
    }
} catch {
    Write-Host "❌ FAIL: Could not detect Cloudflare" -ForegroundColor Red
    $results += [PSCustomObject]@{Test="Cloudflare CDN"; Status="❌ FAIL"; Detail="Error"}
    $failCount++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$results | Format-Table -AutoSize

$totalTests = $passCount + $failCount
$successRate = [math]::Round(($passCount / $totalTests) * 100, 2)

Write-Host "`n📈 Statistics:" -ForegroundColor Cyan
Write-Host "   Total Tests: $totalTests" -ForegroundColor White
Write-Host "   Passed: $passCount" -ForegroundColor Green
Write-Host "   Failed: $failCount" -ForegroundColor Red
Write-Host "   Success Rate: $successRate%" -ForegroundColor $(if ($successRate -ge 90) { "Green" } elseif ($successRate -ge 70) { "Yellow" } else { "Red" })

if ($failCount -eq 0) {
    Write-Host "`n🎉 All tests passed! Your domain is fully operational!" -ForegroundColor Green
} elseif ($successRate -ge 80) {
    Write-Host "`n⚠️  Most tests passed but some issues detected. Review failures above." -ForegroundColor Yellow
} else {
    Write-Host "`n❌ Multiple tests failed. Please review the setup guide and try again." -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($failCount -eq 0) {
    exit 0
} else {
    exit 1
}
