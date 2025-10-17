# Quick Test Script for Render Deployment

Write-Host "🔍 Testing Render Deployment..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Database Connection
Write-Host "Test 1: Database Connection Test" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/db-test" -Method Get -ErrorAction Stop
    Write-Host "✅ Database connection successful!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   User Count: $($response.userCount)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Database connection failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.ErrorDetails.Message) {
        try {
            $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
            Write-Host "   Details: $($errorDetails.error)" -ForegroundColor Gray
            if ($errorDetails.error -like "*does not exist*") {
                Write-Host "" -ForegroundColor Yellow
                Write-Host "⚠️  DATABASE TABLES NOT CREATED YET!" -ForegroundColor Yellow
                Write-Host "   This means migrations haven't run on Render." -ForegroundColor Yellow
                Write-Host "   Check Render Dashboard → Logs for migration status." -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   Raw Error: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 2: User Registration
Write-Host "Test 2: User Registration" -ForegroundColor Yellow
try {
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $body = @{
        email = "testuser$timestamp@example.com"
        password = "password123"
        username = "testuser$timestamp"
        firstName = "Test"
        lastName = "User"
    } | ConvertTo-Json

    $headers = @{
        "Content-Type" = "application/json"
        "X-API-Key" = "Q&ozq^zgqp7ReKem033jOR65npiPzAT*AxN3@jA^Gchg"
    }

    $response = Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/api/auth/register" -Method Post -Body $body -Headers $headers -ErrorAction Stop
    Write-Host "✅ User registration successful!" -ForegroundColor Green
    Write-Host "   User ID: $($response.user.id)" -ForegroundColor Gray
    Write-Host "   Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "   Token: $($response.token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ User registration failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    if ($_.ErrorDetails.Message) {
        Write-Host "   Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "---" -ForegroundColor Gray
Write-Host ""

# Test 3: Health Check
Write-Host "Test 3: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://advancia-backend.onrender.com/health" -Method Get -ErrorAction Stop
    Write-Host "✅ Health check successful!" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Gray
    Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Health check failed!" -ForegroundColor Red
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "🎯 Testing Complete!" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
