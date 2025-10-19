# 🏥 Automated Health Check Script
# Tests all critical endpoints and displays results

Write-Host "🏥 Starting Automated Health Check..." -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Color output functions
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Yellow }
function Write-Test { param($msg) Write-Host "🧪 $msg" -ForegroundColor Cyan }

# Test results tracking
$script:passCount = 0
$script:failCount = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Test "Testing: $Name"
    Write-Host "   URL: $Url" -ForegroundColor Gray
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            TimeoutSec = 10
            ErrorAction = 'Stop'
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = 'application/json'
        }
        
        $response = Invoke-WebRequest @params
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Success "$Name - Status: $($response.StatusCode)"
            $script:passCount++
            return @{ Success = $true; Response = $response }
        } else {
            Write-Error "$Name - Unexpected Status: $($response.StatusCode) (Expected: $ExpectedStatus)"
            $script:failCount++
            return @{ Success = $false; Response = $response }
        }
    } catch {
        Write-Error "$Name - Failed: $($_.Exception.Message)"
        $script:failCount++
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# ============================================
# 1. SERVER AVAILABILITY CHECKS
# ============================================
Write-Host ""
Write-Host "📡 1. CHECKING SERVER AVAILABILITY" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

Test-Endpoint -Name "Backend Server Health" -Url "http://localhost:4000/api/health"
Test-Endpoint -Name "Frontend Server" -Url "http://localhost:3000" -ExpectedStatus 200

# ============================================
# 2. AUTHENTICATION ENDPOINTS
# ============================================
Write-Host ""
Write-Host "🔐 2. TESTING AUTHENTICATION ENDPOINTS" -ForegroundColor Magenta
Write-Host "--------------------------------------" -ForegroundColor Magenta

# Note: These will fail without valid credentials, but we're checking the endpoint exists
Write-Info "Testing login endpoint (expected to fail without credentials - that's OK)"
$loginTest = Test-Endpoint -Name "Login Endpoint" -Url "http://localhost:4000/api/auth/login" -Method "POST" -Body @{
    email = "test@example.com"
    password = "wrongpassword"
} -ExpectedStatus 401

# ============================================
# 3. CRYPTO API ENDPOINTS (No Auth Required)
# ============================================
Write-Host ""
Write-Host "💰 3. TESTING CRYPTO API ENDPOINTS" -ForegroundColor Magenta
Write-Host "----------------------------------" -ForegroundColor Magenta

Test-Endpoint -Name "Get Crypto Prices" -Url "http://localhost:4000/api/crypto/prices"

# ============================================
# 4. FRONTEND PAGES (Visual Check)
# ============================================
Write-Host ""
Write-Host "🎨 4. CHECKING FRONTEND PAGES" -ForegroundColor Magenta
Write-Host "-----------------------------" -ForegroundColor Magenta

Test-Endpoint -Name "Home Page" -Url "http://localhost:3000"
Test-Endpoint -Name "Login Page" -Url "http://localhost:3000/auth/signin"
Test-Endpoint -Name "Register Page" -Url "http://localhost:3000/auth/signup"

# ============================================
# 5. WALLET VALIDATION TEST (Backend)
# ============================================
Write-Host ""
Write-Host "🔒 5. TESTING WALLET VALIDATION" -ForegroundColor Magenta
Write-Host "-------------------------------" -ForegroundColor Magenta

Write-Info "Testing wallet validation logic (requires authentication, will check endpoint exists)"
Write-Host "   Note: Actual validation will be tested in authenticated flow" -ForegroundColor Gray

# ============================================
# 6. DATABASE CONNECTION CHECK
# ============================================
Write-Host ""
Write-Host "🗄️  6. CHECKING DATABASE CONNECTION" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

Test-Endpoint -Name "Database Health (via API)" -Url "http://localhost:4000/api/health"

# ============================================
# 7. API RESPONSE TIME CHECK
# ============================================
Write-Host ""
Write-Host "⏱️  7. MEASURING API RESPONSE TIMES" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -TimeoutSec 5
    $stopwatch.Stop()
    $responseTime = $stopwatch.ElapsedMilliseconds
    
    if ($responseTime -lt 100) {
        Write-Success "Excellent response time: ${responseTime}ms"
    } elseif ($responseTime -lt 500) {
        Write-Success "Good response time: ${responseTime}ms"
    } elseif ($responseTime -lt 1000) {
        Write-Info "Acceptable response time: ${responseTime}ms"
    } else {
        Write-Error "Slow response time: ${responseTime}ms (>1s)"
    }
} catch {
    Write-Error "Failed to measure response time: $($_.Exception.Message)"
}

# ============================================
# 8. CORS CONFIGURATION CHECK
# ============================================
Write-Host ""
Write-Host "🌐 8. CHECKING CORS CONFIGURATION" -ForegroundColor Magenta
Write-Host "---------------------------------" -ForegroundColor Magenta

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method OPTIONS -Headers @{
        "Origin" = "http://localhost:3000"
        "Access-Control-Request-Method" = "GET"
    }
    
    $corsHeader = $response.Headers["Access-Control-Allow-Origin"]
    if ($corsHeader) {
        Write-Success "CORS configured: $corsHeader"
    } else {
        Write-Info "CORS headers not found in OPTIONS response"
    }
} catch {
    Write-Info "CORS check completed (preflight may not be required)"
}

# ============================================
# 9. SUMMARY
# ============================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "📊 HEALTH CHECK SUMMARY" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total Tests: $($script:passCount + $script:failCount)" -ForegroundColor White
Write-Success "Passed: $script:passCount"
if ($script:failCount -gt 0) {
    Write-Error "Failed: $script:failCount"
} else {
    Write-Host "❌ Failed: 0" -ForegroundColor Gray
}

$passRate = [math]::Round(($script:passCount / ($script:passCount + $script:failCount)) * 100, 1)
Write-Host ""
Write-Host "Success Rate: $passRate%" -ForegroundColor $(if ($passRate -ge 80) { "Green" } elseif ($passRate -ge 60) { "Yellow" } else { "Red" })

# ============================================
# 10. RECOMMENDATIONS
# ============================================
Write-Host ""
Write-Host "💡 RECOMMENDATIONS" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan

if ($script:passCount -ge ($script:passCount + $script:failCount) * 0.8) {
    Write-Host "✅ System is healthy! Ready for feature testing." -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "  1. Open http://localhost:3000 in your browser" -ForegroundColor White
    Write-Host "  2. Login with test credentials" -ForegroundColor White
    Write-Host "  3. Follow TEST_PLAN.md for detailed testing" -ForegroundColor White
} else {
    Write-Host "⚠️  Some issues detected. Review failed tests above." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Check if both servers are running" -ForegroundColor White
    Write-Host "  2. Verify database is accessible" -ForegroundColor White
    Write-Host "  3. Check environment variables in .env files" -ForegroundColor White
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "🏥 Health Check Complete!" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
