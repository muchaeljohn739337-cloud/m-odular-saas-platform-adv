# Debug script for failing ETH endpoints
Write-Host "🔍 Debugging Failed ETH Endpoints`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:4000"

# Test 1: Gas Estimation Endpoint
Write-Host "Test 1: Gas Cost Estimation" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

$payload1 = @{
    toAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    amountEth = "0.1"
} | ConvertTo-Json

Write-Host "Payload:" -ForegroundColor Gray
Write-Host $payload1 -ForegroundColor Gray
Write-Host ""

try {
    $response1 = Invoke-WebRequest -Uri "$baseUrl/api/eth/estimate-cost" -Method Post -Body $payload1 -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ SUCCESS - Status: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response1.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message:" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n"

# Test 2: Withdrawal Endpoint
Write-Host "Test 2: Withdrawal Request" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

$payload2 = @{
    userId = "test-user-123"
    toAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    amountEth = "0.5"
    note = "Test withdrawal"
} | ConvertTo-Json

Write-Host "Payload:" -ForegroundColor Gray
Write-Host $payload2 -ForegroundColor Gray
Write-Host ""

try {
    $response2 = Invoke-WebRequest -Uri "$baseUrl/api/eth/withdrawal" -Method Post -Body $payload2 -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ SUCCESS - Status: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response2.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message:" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n"

# Test with different payload formats
Write-Host "Test 3: Gas Estimation with Number Type" -ForegroundColor Yellow
Write-Host "==========================================" -ForegroundColor Yellow

$payload3 = @{
    toAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    amountEth = 0.1
} | ConvertTo-Json

Write-Host "Payload:" -ForegroundColor Gray
Write-Host $payload3 -ForegroundColor Gray
Write-Host ""

try {
    $response3 = Invoke-WebRequest -Uri "$baseUrl/api/eth/estimate-cost" -Method Post -Body $payload3 -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ SUCCESS - Status: $($response3.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response3.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message:" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n"

# Test 4: Withdrawal with Number Type
Write-Host "Test 4: Withdrawal with Number Type" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

$payload4 = @{
    userId = "test-user-123"
    toAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
    amountEth = 0.5
    note = "Test withdrawal"
} | ConvertTo-Json

Write-Host "Payload:" -ForegroundColor Gray
Write-Host $payload4 -ForegroundColor Gray
Write-Host ""

try {
    $response4 = Invoke-WebRequest -Uri "$baseUrl/api/eth/withdrawal" -Method Post -Body $payload4 -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ SUCCESS - Status: $($response4.StatusCode)" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Gray
    $response4.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "❌ FAILED - Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "Error Message:" -ForegroundColor Red
    try {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host $errorBody -ForegroundColor Red
    } catch {
        Write-Host $_.Exception.Message -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Debug Tests Complete!" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
